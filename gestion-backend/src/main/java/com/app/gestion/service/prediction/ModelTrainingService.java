package com.app.gestion.service.prediction;

import com.app.gestion.dto.prediction.TrainingDataPoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import smile.data.DataFrame;
import smile.data.formula.Formula;
import smile.data.vector.DoubleVector;
import smile.regression.RandomForest;

import jakarta.annotation.PostConstruct;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service responsable de l'entraînement, la sérialisation et le chargement
 * des modèles Random Forest via SMILE.
 *
 * Un modèle est entraîné par article. Le modèle global (tous articles confondus)
 * est utilisé comme fallback quand un article n'a pas assez de données.
 */
@Service
@Slf4j
public class ModelTrainingService {

    private final TrainingDataService trainingDataService;

    /** Modèle global (tous articles confondus) */
    private volatile RandomForest globalModel;

    /** Modèles spécifiques par article */
    private final ConcurrentHashMap<Integer, RandomForest> articleModels = new ConcurrentHashMap<>();

    /** Date du dernier entraînement */
    private volatile LocalDateTime lastTrainingDate;

    /** Nombre de données utilisées pour l'entraînement */
    private volatile int trainingDataCount;

    /** Erreur MAE du modèle global */
    private volatile Double globalMAE;

    /** R² du modèle global */
    private volatile Double globalR2;

    @Value("${prediction.model.path:./models}")
    private String modelBasePath;

    @Value("${prediction.model.ntrees:100}")
    private int nTrees;

    @Value("${prediction.model.maxDepth:10}")
    private int maxDepth;

    @Value("${prediction.model.minArticleDataPoints:10}")
    private int minArticleDataPoints;

    private static final String GLOBAL_MODEL_FILE = "global_model.smile";
    private static final String[] FEATURE_NAMES = {
            "mois", "qtyMoisPrec", "qtyMemesMoisAnneePrec",
            "moyenneMobile3m", "promotion", "tendanceCroissance"
    };

    public ModelTrainingService(TrainingDataService trainingDataService) {
        this.trainingDataService = trainingDataService;
    }

    /**
     * Au démarrage, tente de charger les modèles sérialisés.
     */
    @PostConstruct
    public void init() {
        try {
            loadModelsFromDisk();
        } catch (Exception e) {
            log.warn("Aucun modèle trouvé sur disque, un entraînement sera nécessaire : {}", e.getMessage());
        }
    }

    /**
     * Entraîne le modèle global et les modèles par article.
     * À appeler via un job planifié (cron).
     */
    public synchronized void trainAllModels() {
        log.info("=== DÉBUT ENTRAÎNEMENT DES MODÈLES DE PRÉDICTION ===");
        long start = System.currentTimeMillis();

        try {
            Map<Integer, List<TrainingDataPoint>> allData = trainingDataService.prepareTrainingData();

            if (allData.isEmpty()) {
                log.warn("Aucune donnée d'entraînement disponible. Entraînement annulé.");
                return;
            }

            // 1. Entraînement du modèle global
            trainGlobalModel(allData);

            // 2. Entraînement des modèles par article
            trainArticleModels(allData);

            // 3. Sérialisation sur disque
            saveModelsToDisk();

            lastTrainingDate = LocalDateTime.now();

            long duration = System.currentTimeMillis() - start;
            log.info("=== ENTRAÎNEMENT TERMINÉ en {}ms - {} articles traités ===",
                    duration, allData.size());

        } catch (Exception e) {
            log.error("Erreur lors de l'entraînement des modèles", e);
            throw new RuntimeException("Échec de l'entraînement des modèles", e);
        }
    }

    /**
     * Entraîne le modèle global avec toutes les données de tous les articles.
     */
    private void trainGlobalModel(Map<Integer, List<TrainingDataPoint>> allData) {
        List<TrainingDataPoint> allPoints = allData.values().stream()
                .flatMap(List::stream)
                .toList();

        if (allPoints.size() < 10) {
            log.warn("Pas assez de données pour le modèle global ({} points)", allPoints.size());
            return;
        }

        trainingDataCount = allPoints.size();
        log.info("Entraînement du modèle global avec {} points de données...", allPoints.size());

        DataFrame df = buildDataFrame(allPoints);
        Formula formula = Formula.lhs("quantiteVendue");

        int mtry = Math.max(1, (int) Math.sqrt(allPoints.get(0).toFeatureArray().length));
        globalModel = RandomForest.fit(formula, df, nTrees, mtry, maxDepth, 500, 1, 0.8);

        // Calcul des métriques
        double[] predictions = new double[allPoints.size()];
        double[] actuals = new double[allPoints.size()];
        for (int i = 0; i < allPoints.size(); i++) {
            predictions[i] = globalModel.predict(df.get(i));
            actuals[i] = allPoints.get(i).getQuantiteVendue();
        }
        globalMAE = calculateMAE(predictions, actuals);
        globalR2 = calculateR2(predictions, actuals);

        log.info("Modèle global - MAE: {}, R²: {}", String.format("%.2f", globalMAE), String.format("%.4f", globalR2));
    }

    /**
     * Entraîne un modèle spécifique pour chaque article ayant assez de données.
     */
    private void trainArticleModels(Map<Integer, List<TrainingDataPoint>> allData) {
        articleModels.clear();
        int trained = 0;

        for (Map.Entry<Integer, List<TrainingDataPoint>> entry : allData.entrySet()) {
            Integer articleId = entry.getKey();
            List<TrainingDataPoint> points = entry.getValue();

            if (points.size() >= minArticleDataPoints) {
                try {
                    DataFrame df = buildDataFrame(points);
                    Formula formula = Formula.lhs("quantiteVendue");

                    int mtry = Math.max(1, (int) Math.sqrt(points.get(0).toFeatureArray().length));
                    RandomForest model = RandomForest.fit(formula, df, nTrees,
                            mtry, maxDepth, 500, 1, 0.8);

                    articleModels.put(articleId, model);
                    trained++;
                } catch (Exception e) {
                    log.warn("Échec entraînement pour article {} : {}", articleId, e.getMessage());
                }
            }
        }

        log.info("{} modèles spécifiques entraînés sur {} articles", trained, allData.size());
    }

    /**
     * Construit un DataFrame SMILE à partir des points d'entraînement.
     */
    private DataFrame buildDataFrame(List<TrainingDataPoint> points) {
        int n = points.size();
        double[] mois = new double[n];
        double[] qtyMoisPrec = new double[n];
        double[] qtyMemesMoisAnneePrec = new double[n];
        double[] moyenneMobile3m = new double[n];
        double[] promotion = new double[n];
        double[] tendanceCroissance = new double[n];
        double[] quantiteVendue = new double[n];

        for (int i = 0; i < n; i++) {
            TrainingDataPoint p = points.get(i);
            double[] features = p.toFeatureArray();
            mois[i] = features[0];
            qtyMoisPrec[i] = features[1];
            qtyMemesMoisAnneePrec[i] = features[2];
            moyenneMobile3m[i] = features[3];
            promotion[i] = features[4];
            tendanceCroissance[i] = features[5];
            quantiteVendue[i] = p.getQuantiteVendue();
        }

        return DataFrame.of(
                DoubleVector.of("mois", mois),
                DoubleVector.of("qtyMoisPrec", qtyMoisPrec),
                DoubleVector.of("qtyMemesMoisAnneePrec", qtyMemesMoisAnneePrec),
                DoubleVector.of("moyenneMobile3m", moyenneMobile3m),
                DoubleVector.of("promotion", promotion),
                DoubleVector.of("tendanceCroissance", tendanceCroissance),
                DoubleVector.of("quantiteVendue", quantiteVendue)
        );
    }

    /**
     * Prédit la quantité de ventes pour un article donné.
     *
     * @param articleId ID de l'article
     * @param features  Tableau de features [mois, qtyPrev, qtyLastYear, movAvg, promo, trend]
     * @return Quantité prédite
     */
    public double predict(Integer articleId, double[] features) {
        // Utilise le modèle spécifique si disponible, sinon le global
        RandomForest model = articleModels.getOrDefault(articleId, globalModel);

        if (model == null) {
            throw new IllegalStateException(
                    "Aucun modèle disponible. Veuillez lancer l'entraînement d'abord.");
        }

        // Construire un DataFrame à une seule ligne pour la prédiction
        DataFrame df = DataFrame.of(
                DoubleVector.of("mois", new double[]{features[0]}),
                DoubleVector.of("qtyMoisPrec", new double[]{features[1]}),
                DoubleVector.of("qtyMemesMoisAnneePrec", new double[]{features[2]}),
                DoubleVector.of("moyenneMobile3m", new double[]{features[3]}),
                DoubleVector.of("promotion", new double[]{features[4]}),
                DoubleVector.of("tendanceCroissance", new double[]{features[5]})
        );

        double prediction = model.predict(df.get(0));
        return Math.max(0, prediction); // Pas de quantité négative
    }

    /**
     * Vérifie si un modèle est disponible.
     */
    public boolean isModelAvailable() {
        return globalModel != null;
    }

    /**
     * Vérifie si un modèle spécifique existe pour un article.
     */
    public boolean hasArticleModel(Integer articleId) {
        return articleModels.containsKey(articleId);
    }

    // === SÉRIALISATION / DÉSÉRIALISATION ===

    private void saveModelsToDisk() {
        try {
            Path dir = Paths.get(modelBasePath);
            Files.createDirectories(dir);

            // Sauvegarde du modèle global
            if (globalModel != null) {
                try (ObjectOutputStream oos = new ObjectOutputStream(
                        new FileOutputStream(dir.resolve(GLOBAL_MODEL_FILE).toFile()))) {
                    oos.writeObject(globalModel);
                }
                log.info("Modèle global sauvegardé sur disque");
            }

            // Sauvegarde des modèles par article
            for (Map.Entry<Integer, RandomForest> entry : articleModels.entrySet()) {
                String filename = "model_article_" + entry.getKey() + ".smile";
                try (ObjectOutputStream oos = new ObjectOutputStream(
                        new FileOutputStream(dir.resolve(filename).toFile()))) {
                    oos.writeObject(entry.getValue());
                }
            }

            // Sauvegarde des métadonnées
            try (ObjectOutputStream oos = new ObjectOutputStream(
                    new FileOutputStream(dir.resolve("metadata.dat").toFile()))) {
                oos.writeObject(lastTrainingDate);
                oos.writeInt(trainingDataCount);
                oos.writeObject(globalMAE);
                oos.writeObject(globalR2);
            }

            log.info("{} modèles sauvegardés sur disque dans {}", articleModels.size() + 1, modelBasePath);

        } catch (IOException e) {
            log.error("Erreur lors de la sauvegarde des modèles", e);
        }
    }

    private void loadModelsFromDisk() {
        Path dir = Paths.get(modelBasePath);

        if (!Files.exists(dir)) {
            throw new RuntimeException("Répertoire de modèles introuvable : " + modelBasePath);
        }

        // Chargement du modèle global
        Path globalPath = dir.resolve(GLOBAL_MODEL_FILE);
        if (Files.exists(globalPath)) {
            try (ObjectInputStream ois = new ObjectInputStream(
                    new FileInputStream(globalPath.toFile()))) {
                globalModel = (RandomForest) ois.readObject();
                log.info("Modèle global chargé depuis le disque");
            } catch (Exception e) {
                log.error("Erreur chargement modèle global", e);
            }
        }

        // Chargement des modèles par article
        try {
            Files.list(dir)
                    .filter(p -> p.getFileName().toString().startsWith("model_article_"))
                    .forEach(p -> {
                        try (ObjectInputStream ois = new ObjectInputStream(
                                new FileInputStream(p.toFile()))) {
                            String name = p.getFileName().toString();
                            int articleId = Integer.parseInt(
                                    name.replace("model_article_", "").replace(".smile", ""));
                            articleModels.put(articleId, (RandomForest) ois.readObject());
                        } catch (Exception e) {
                            log.warn("Erreur chargement modèle {}", p.getFileName(), e);
                        }
                    });
        } catch (IOException e) {
            log.warn("Erreur lors du parcours des modèles par article", e);
        }

        // Chargement des métadonnées
        Path metaPath = dir.resolve("metadata.dat");
        if (Files.exists(metaPath)) {
            try (ObjectInputStream ois = new ObjectInputStream(
                    new FileInputStream(metaPath.toFile()))) {
                lastTrainingDate = (LocalDateTime) ois.readObject();
                trainingDataCount = ois.readInt();
                globalMAE = (Double) ois.readObject();
                globalR2 = (Double) ois.readObject();
            } catch (Exception e) {
                log.warn("Erreur chargement métadonnées", e);
            }
        }

        log.info("Modèles chargés : 1 global + {} spécifiques", articleModels.size());
    }

    // === MÉTRIQUES ===

    private double calculateMAE(double[] predicted, double[] actual) {
        double sum = 0;
        for (int i = 0; i < predicted.length; i++) {
            sum += Math.abs(predicted[i] - actual[i]);
        }
        return sum / predicted.length;
    }

    private double calculateR2(double[] predicted, double[] actual) {
        double meanActual = 0;
        for (double v : actual) meanActual += v;
        meanActual /= actual.length;

        double ssRes = 0, ssTot = 0;
        for (int i = 0; i < actual.length; i++) {
            ssRes += Math.pow(actual[i] - predicted[i], 2);
            ssTot += Math.pow(actual[i] - meanActual, 2);
        }

        return ssTot == 0 ? 0 : 1 - (ssRes / ssTot);
    }

    // === GETTERS ===

    public LocalDateTime getLastTrainingDate() { return lastTrainingDate; }
    public int getTrainingDataCount() { return trainingDataCount; }
    public Double getGlobalMAE() { return globalMAE; }
    public Double getGlobalR2() { return globalR2; }
    public int getArticleModelCount() { return articleModels.size(); }
}
