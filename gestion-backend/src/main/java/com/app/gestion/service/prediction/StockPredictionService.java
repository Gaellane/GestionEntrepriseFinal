package com.app.gestion.service.prediction;

import com.app.gestion.dto.prediction.*;
import com.app.gestion.dto.prediction.SalesPredictionResponseDto.NiveauAlerte;
import com.app.gestion.model.Article;
import com.app.gestion.repository.ArticleRepository;
import com.app.gestion.repository.LotRepository;
import com.app.gestion.repository.StockReservationRepository;
import com.app.gestion.repository.VenteLigneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service principal de prédiction des ventes et d'aide au réapprovisionnement.
 *
 * Responsabilités :
 * - Prédire les ventes futures pour un article ou tous les articles
 * - Comparer les prédictions au stock disponible
 * - Générer des alertes de rupture de stock
 * - Fournir des recommandations de réapprovisionnement
 *
 * Ce service est le point d'entrée pour le module stock et les contrôleurs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockPredictionService {

    private final ModelTrainingService modelTrainingService;
    private final TrainingDataService trainingDataService;
    private final ArticleRepository articleRepository;
    private final LotRepository lotRepository;
    private final StockReservationRepository stockReservationRepository;
    private final VenteLigneRepository venteLigneRepository;

    /** Seuil d'alerte attention : stock couvre moins de X% de la prédiction */
    @Value("${prediction.alert.attention-threshold:1.2}")
    private double attentionThreshold;

    /** Seuil d'alerte critique : stock couvre moins de X% de la prédiction */
    @Value("${prediction.alert.critical-threshold:0.8}")
    private double criticalThreshold;

    /** Marge de sécurité pour le réapprovisionnement (20% en plus) */
    @Value("${prediction.reorder.safety-margin:1.2}")
    private double safetyMargin;

    /**
     * Prédit les ventes pour un article donné sur un mois/année ciblé.
     */
    public SalesPredictionResponseDto predictForArticle(SalesPredictionRequestDto request) {
        if (!modelTrainingService.isModelAvailable()) {
            throw new IllegalStateException(
                    "Le modèle de prédiction n'est pas encore entraîné. "
                    + "Veuillez lancer l'entraînement via POST /api/predictions/train");
        }

        Article article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Article introuvable : " + request.getArticleId()));

        // Construire les features
        double[] features = trainingDataService.buildPredictionFeatures(
                request.getArticleId(),
                request.getMoisCible(),
                request.getAnneeCible(),
                request.getPromotion() != null ? request.getPromotion() : 0
        );

        // Prédiction
        double quantitePredite = modelTrainingService.predict(request.getArticleId(), features);

        // Récupérer le stock actuel
        double stockActuel = getStockTotal(request.getArticleId(), request.getDepotId());
        double stockReserve = getStockReserve(request.getArticleId());
        double stockDisponible = stockActuel - stockReserve;

        // Analyse et recommandations
        return buildPredictionResponse(article, request.getMoisCible(), request.getAnneeCible(),
                quantitePredite, stockActuel, stockReserve, stockDisponible);
    }

    /**
     * Prédit les ventes pour tous les articles ayant un historique.
     */
    public PredictionSummaryDto predictAllArticles(int moisCible, int anneeCible) {
        if (!modelTrainingService.isModelAvailable()) {
            throw new IllegalStateException(
                    "Le modèle de prédiction n'est pas encore entraîné.");
        }

        List<Integer> articleIds = trainingDataService.getArticlesAvecVentes();
        List<SalesPredictionResponseDto> predictions = new ArrayList<>();

        for (Integer articleId : articleIds) {
            try {
                SalesPredictionRequestDto request = SalesPredictionRequestDto.builder()
                        .articleId(articleId)
                        .moisCible(moisCible)
                        .anneeCible(anneeCible)
                        .promotion(0)
                        .build();

                predictions.add(predictForArticle(request));
            } catch (Exception e) {
                log.warn("Erreur prédiction article {} : {}", articleId, e.getMessage());
            }
        }

        // Tri par niveau d'alerte (critiques en premier)
        predictions.sort(Comparator
                .comparing(SalesPredictionResponseDto::getNiveauAlerte)
                .reversed()
                .thenComparing(SalesPredictionResponseDto::getEcartStockPrediction));

        long alertesCritiques = predictions.stream()
                .filter(p -> p.getNiveauAlerte() == NiveauAlerte.CRITIQUE)
                .count();
        long alertesAttention = predictions.stream()
                .filter(p -> p.getNiveauAlerte() == NiveauAlerte.ATTENTION)
                .count();

        return PredictionSummaryDto.builder()
                .dernierEntrainement(modelTrainingService.getLastTrainingDate())
                .nombreDonneesEntrainement(modelTrainingService.getTrainingDataCount())
                .erreurMoyenne(modelTrainingService.getGlobalMAE())
                .r2Score(modelTrainingService.getGlobalR2())
                .modeleDisponible(modelTrainingService.isModelAvailable())
                .nombreAlertesCritiques(alertesCritiques)
                .nombreAlertesAttention(alertesAttention)
                .predictions(predictions)
                .build();
    }

    /**
     * Retourne uniquement les articles à risque de rupture.
     */
    public List<SalesPredictionResponseDto> getAlertesRupture(int moisCible, int anneeCible) {
        PredictionSummaryDto summary = predictAllArticles(moisCible, anneeCible);
        return summary.getPredictions().stream()
                .filter(SalesPredictionResponseDto::isAlerteRupture)
                .collect(Collectors.toList());
    }

    /**
     * Déclenche l'entraînement des modèles (batch).
     */
    public void triggerTraining() {
        modelTrainingService.trainAllModels();
    }

    /**
     * Retourne les informations sur le modèle (sans prédictions).
     */
    public PredictionSummaryDto getModelInfo() {
        return PredictionSummaryDto.builder()
                .dernierEntrainement(modelTrainingService.getLastTrainingDate())
                .nombreDonneesEntrainement(modelTrainingService.getTrainingDataCount())
                .erreurMoyenne(modelTrainingService.getGlobalMAE())
                .r2Score(modelTrainingService.getGlobalR2())
                .modeleDisponible(modelTrainingService.isModelAvailable())
                .build();
    }

    // ================================================================
    // DASHBOARD COMPLET — données unifiées
    // ================================================================

    private static final String[] MOIS_LABELS = {
        "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    };

    /**
     * Génère le résumé complet du dashboard de prédiction.
     * Combine : prédictions, évolution de stock, tendances clients.
     */
    public DashboardSummaryDto getDashboardSummary(int moisCible, int anneeCible) {
        DashboardSummaryDto.DashboardSummaryDtoBuilder builder = DashboardSummaryDto.builder()
                .modeleDisponible(modelTrainingService.isModelAvailable())
                .dernierEntrainement(modelTrainingService.getLastTrainingDate())
                .nombreDonneesEntrainement(modelTrainingService.getTrainingDataCount())
                .r2Score(modelTrainingService.getGlobalR2())
                .erreurMoyenne(modelTrainingService.getGlobalMAE())
                .moisCible(moisCible)
                .anneeCible(anneeCible);

        if (!modelTrainingService.isModelAvailable()) {
            return builder.build();
        }

        // 1. Prédictions pour le mois cible
        PredictionSummaryDto predictions = predictAllArticles(moisCible, anneeCible);
        List<SalesPredictionResponseDto> preds = predictions.getPredictions();

        double totalVentesPredites = preds.stream()
                .mapToDouble(p -> p.getQuantitePredite() != null ? p.getQuantitePredite() : 0)
                .sum();

        // 2. Ventes du mois précédent (historique réel)
        int prevMois = moisCible == 1 ? 12 : moisCible - 1;
        int prevAnnee = moisCible == 1 ? anneeCible - 1 : anneeCible;
        double totalVentesMoisPrec = getVentesHistoriquesMois(prevMois, prevAnnee);
        double evolPourcent = totalVentesMoisPrec > 0
                ? ((totalVentesPredites - totalVentesMoisPrec) / totalVentesMoisPrec) * 100
                : 0;

        builder.totalArticlesAnalyses(preds.size())
               .alertesCritiques(predictions.getNombreAlertesCritiques())
               .alertesAttention(predictions.getNombreAlertesAttention())
               .articlesSains(preds.size() - predictions.getNombreAlertesCritiques() - predictions.getNombreAlertesAttention())
               .totalVentesPredites(Math.round(totalVentesPredites * 10.0) / 10.0)
               .totalVentesMoisPrecedent(Math.round(totalVentesMoisPrec * 10.0) / 10.0)
               .evolutionVentesPourcent(Math.round(evolPourcent * 10.0) / 10.0)
               .predictions(preds);

        // 3. Évolution de stock sur 6 mois (top 15 articles à risque)
        List<StockEvolutionDto> stockEvolutions = buildStockEvolutions(preds, moisCible, anneeCible, 6, 15);
        int rupture30j = 0, rupture60j = 0, rupture90j = 0;
        double valeurReappro = 0;
        for (StockEvolutionDto se : stockEvolutions) {
            if (se.getMoisAvantRupture() >= 0 && se.getMoisAvantRupture() <= 1) rupture30j++;
            if (se.getMoisAvantRupture() >= 0 && se.getMoisAvantRupture() <= 2) rupture60j++;
            if (se.getMoisAvantRupture() >= 0 && se.getMoisAvantRupture() <= 3) rupture90j++;
        }
        for (SalesPredictionResponseDto p : preds) {
            if (p.getQuantiteReapprovisionnement() != null && p.getQuantiteReapprovisionnement() > 0) {
                valeurReappro += p.getQuantiteReapprovisionnement();
            }
        }
        builder.stockEvolutions(stockEvolutions)
               .articlesEnRuptureSous30j(rupture30j)
               .articlesEnRuptureSous60j(rupture60j)
               .articlesEnRuptureSous90j(rupture90j)
               .valeurReapproNecessaire(Math.round(valeurReappro));

        // 4. Tendances clients
        List<ClientTrendDto> clientTrends = buildClientTrends(anneeCible);
        long hausse = clientTrends.stream().filter(c -> "HAUSSE".equals(c.getTendance())).count();
        long baisse = clientTrends.stream().filter(c -> "BAISSE".equals(c.getTendance())).count();
        long stables = clientTrends.stream().filter(c -> "STABLE".equals(c.getTendance())).count();
        long nouveaux = clientTrends.stream().filter(c -> "NOUVEAU".equals(c.getTendance())).count();

        builder.clientTrends(clientTrends)
               .clientsEnHausse((int) hausse)
               .clientsEnBaisse((int) baisse)
               .clientsStables((int) stables)
               .nouveauxClients((int) nouveaux);

        return builder.build();
    }

    /**
     * Construit l'évolution de stock projetée sur N mois pour les articles les plus à risque.
     */
    public List<StockEvolutionDto> buildStockEvolutions(
            List<SalesPredictionResponseDto> preds, int moisDepart, int anneeDepart,
            int horizonMois, int maxArticles) {

        // Prendre les articles triés par écart (plus négatif = plus à risque)
        List<SalesPredictionResponseDto> topRisk = preds.stream()
                .sorted(Comparator.comparingDouble(p -> p.getEcartStockPrediction() != null ? p.getEcartStockPrediction() : Double.MAX_VALUE))
                .limit(maxArticles)
                .collect(Collectors.toList());

        // Historique réel par article/mois pour comparaison
        Map<String, Double> historique = buildHistoriqueMap();

        List<StockEvolutionDto> evolutions = new ArrayList<>();

        for (SalesPredictionResponseDto pred : topRisk) {
            double stockCourant = pred.getStockDisponibleNet() != null ? pred.getStockDisponibleNet() : 0;
            double stockActuel = pred.getStockActuel() != null ? pred.getStockActuel() : 0;
            double stockReserve = pred.getStockReserve() != null ? pred.getStockReserve() : 0;

            List<ForecastPointDto> points = new ArrayList<>();
            int moisAvantRupture = -1;
            double runningStock = stockCourant;

            for (int i = 0; i < horizonMois; i++) {
                int m = ((moisDepart - 1 + i) % 12) + 1;
                int a = anneeDepart + ((moisDepart - 1 + i) / 12);

                // Prédiction pour ce mois
                double ventesPredites;
                if (i == 0) {
                    ventesPredites = pred.getQuantitePredite() != null ? pred.getQuantitePredite() : 0;
                } else {
                    try {
                        double[] features = trainingDataService.buildPredictionFeatures(
                                pred.getArticleId(), m, a, 0);
                        ventesPredites = Math.max(0, modelTrainingService.predict(pred.getArticleId(), features));
                    } catch (Exception e) {
                        ventesPredites = pred.getQuantitePredite() != null ? pred.getQuantitePredite() : 0;
                    }
                }

                runningStock -= ventesPredites;
                boolean rupture = runningStock <= 0;
                if (rupture && moisAvantRupture < 0) {
                    moisAvantRupture = i;
                }

                // Historique réel
                String key = pred.getArticleId() + "-" + a + "-" + m;
                double histValue = historique.getOrDefault(key, -1.0);

                points.add(ForecastPointDto.builder()
                        .mois(m)
                        .annee(a)
                        .moisLabel(MOIS_LABELS[m])
                        .ventesPredites(Math.round(ventesPredites * 10.0) / 10.0)
                        .ventesHistoriques(histValue >= 0 ? histValue : -1)
                        .stockProjetee(Math.round(Math.max(0, runningStock) * 10.0) / 10.0)
                        .rupturePrevue(rupture)
                        .build());
            }

            evolutions.add(StockEvolutionDto.builder()
                    .articleId(pred.getArticleId())
                    .articleNom(pred.getArticleNom())
                    .articleRef(pred.getArticleRef())
                    .stockActuel(stockActuel)
                    .stockReserve(stockReserve)
                    .stockDisponibleNet(stockCourant)
                    .moisAvantRupture(moisAvantRupture)
                    .evolution(points)
                    .build());
        }

        return evolutions;
    }

    /**
     * Construit les tendances clients en comparant l'année cible à l'année précédente.
     */
    public List<ClientTrendDto> buildClientTrends(int anneeCible) {
        List<Object[]> rawData = venteLigneRepository.findTendancesClients();

        // Organiser par client et année
        Map<Integer, Map<Integer, double[]>> clientYearData = new LinkedHashMap<>();
        Map<Integer, String> clientNames = new HashMap<>();

        for (Object[] row : rawData) {
            int clientId = ((Number) row[0]).intValue();
            String clientNom = (String) row[1];
            int annee = ((Number) row[2]).intValue();
            int nbCommandes = ((Number) row[3]).intValue();
            double totalMontant = ((Number) row[4]).doubleValue();

            clientNames.put(clientId, clientNom);
            clientYearData
                    .computeIfAbsent(clientId, k -> new HashMap<>())
                    .put(annee, new double[]{ nbCommandes, totalMontant });
        }

        List<ClientTrendDto> trends = new ArrayList<>();
        int anneePrecedente = anneeCible - 1;

        for (Map.Entry<Integer, Map<Integer, double[]>> entry : clientYearData.entrySet()) {
            int clientId = entry.getKey();
            Map<Integer, double[]> yearData = entry.getValue();

            double[] courant = yearData.getOrDefault(anneeCible, new double[]{0, 0});
            double[] precedent = yearData.getOrDefault(anneePrecedente, new double[]{0, 0});

            double totalCourant = courant[1];
            double totalPrecedent = precedent[1];
            int nbCmdCourant = (int) courant[0];
            int nbCmdPrecedent = (int) precedent[0];

            // Pas de données sur les deux années → ignorer
            if (totalCourant == 0 && totalPrecedent == 0) continue;

            double evolPourcent = totalPrecedent > 0
                    ? ((totalCourant - totalPrecedent) / totalPrecedent) * 100
                    : 0;

            String tendance;
            if (totalPrecedent == 0 && totalCourant > 0) {
                tendance = "NOUVEAU";
                evolPourcent = 100;
            } else if (evolPourcent > 10) {
                tendance = "HAUSSE";
            } else if (evolPourcent < -10) {
                tendance = "BAISSE";
            } else {
                tendance = "STABLE";
            }

            double panierMoyen = nbCmdCourant > 0 ? totalCourant / nbCmdCourant :
                    (nbCmdPrecedent > 0 ? totalPrecedent / nbCmdPrecedent : 0);

            trends.add(ClientTrendDto.builder()
                    .clientId(clientId)
                    .clientNom(clientNames.get(clientId))
                    .totalAchatsAnneeCourante(Math.round(totalCourant))
                    .totalAchatsAnneePrecedente(Math.round(totalPrecedent))
                    .evolutionPourcent(Math.round(evolPourcent * 10.0) / 10.0)
                    .nombreCommandesAnneeCourante(nbCmdCourant)
                    .nombreCommandesAnneePrecedente(nbCmdPrecedent)
                    .panierMoyen(Math.round(panierMoyen))
                    .tendance(tendance)
                    .build());
        }

        // Trier : HAUSSE en premier par volume, puis BAISSE, puis STABLE
        trends.sort(Comparator
                .<ClientTrendDto, Integer>comparing(c -> {
                    switch (c.getTendance()) {
                        case "HAUSSE": return 0;
                        case "NOUVEAU": return 1;
                        case "BAISSE": return 2;
                        default: return 3;
                    }
                })
                .thenComparingDouble(c -> -c.getTotalAchatsAnneeCourante()));

        return trends;
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Récupère le total de ventes historiques réelles pour un mois donné.
     */
    private double getVentesHistoriquesMois(int mois, int annee) {
        try {
            List<Object[]> totals = venteLigneRepository.findVentesMensuellesTotales();
            for (Object[] row : totals) {
                int a = ((Number) row[0]).intValue();
                int m = ((Number) row[1]).intValue();
                if (a == annee && m == mois) {
                    return ((Number) row[2]).doubleValue();
                }
            }
        } catch (Exception e) {
            log.warn("Erreur récupération historique mois {}/{} : {}", mois, annee, e.getMessage());
        }
        return 0;
    }

    /**
     * Construit une map rapide articleId-annee-mois -> quantité vendue.
     */
    private Map<String, Double> buildHistoriqueMap() {
        Map<String, Double> map = new HashMap<>();
        try {
            List<Object[]> rawData = venteLigneRepository.findVentesMensuellesParArticle();
            for (Object[] row : rawData) {
                int articleId = ((Number) row[0]).intValue();
                int annee = ((Number) row[1]).intValue();
                int mois = ((Number) row[2]).intValue();
                double qty = ((Number) row[3]).doubleValue();
                map.put(articleId + "-" + annee + "-" + mois, qty);
            }
        } catch (Exception e) {
            log.warn("Erreur construction historique map : {}", e.getMessage());
        }
        return map;
    }

    private SalesPredictionResponseDto buildPredictionResponse(
            Article article, int mois, int annee,
            double quantitePredite, double stockActuel,
            double stockReserve, double stockDisponible) {

        double ecart = stockDisponible - quantitePredite;

        // Déterminer le niveau d'alerte
        NiveauAlerte niveau;
        boolean alerteRupture;
        String recommandation;
        double quantiteReappro = 0;

        double ratio = quantitePredite > 0 ? stockDisponible / quantitePredite : Double.MAX_VALUE;

        if (ratio <= criticalThreshold) {
            niveau = NiveauAlerte.CRITIQUE;
            alerteRupture = true;
            quantiteReappro = Math.ceil((quantitePredite * safetyMargin) - stockDisponible);
            recommandation = String.format(
                    "URGENT : Réapprovisionnement immédiat de %.0f unités recommandé. "
                    + "Le stock actuel ne couvre que %.0f%% de la demande prévue.",
                    quantiteReappro, ratio * 100);

        } else if (ratio <= attentionThreshold) {
            niveau = NiveauAlerte.ATTENTION;
            alerteRupture = true;
            quantiteReappro = Math.ceil((quantitePredite * safetyMargin) - stockDisponible);
            recommandation = String.format(
                    "Planifier un réapprovisionnement de %.0f unités. "
                    + "Le stock actuel couvre %.0f%% de la demande prévue.",
                    quantiteReappro, ratio * 100);

        } else {
            niveau = NiveauAlerte.NORMAL;
            alerteRupture = false;
            recommandation = String.format(
                    "Stock suffisant. Couverture de %.0f%% par rapport à la demande prévue.",
                    ratio * 100);
        }

        // Score de confiance (basé sur l'existence d'un modèle spécifique)
        double scoreConfiance = modelTrainingService.hasArticleModel(article.getId()) ? 0.85 : 0.65;

        return SalesPredictionResponseDto.builder()
                .articleId(article.getId())
                .articleNom(article.getArticleNom())
                .articleRef(article.getRefe())
                .mois(mois)
                .annee(annee)
                .quantitePredite(Math.round(quantitePredite * 100.0) / 100.0)
                .stockActuel(stockActuel)
                .stockReserve(stockReserve)
                .stockDisponibleNet(stockDisponible)
                .ecartStockPrediction(Math.round(ecart * 100.0) / 100.0)
                .alerteRupture(alerteRupture)
                .niveauAlerte(niveau)
                .recommandation(recommandation)
                .quantiteReapprovisionnement(Math.max(0, quantiteReappro))
                .scoreConfiance(scoreConfiance)
                .build();
    }

    /**
     * Calcule le stock total pour un article (somme des quantités restantes des lots).
     */
    private double getStockTotal(Integer articleId, Integer depotId) {
        try {
            if (depotId != null) {
                Double stock = lotRepository.calculerStockTheorique(articleId, depotId);
                return stock != null ? stock : 0.0;
            } else {
                Double stock = lotRepository.calculerStockTotalParArticle(articleId);
                return stock != null ? stock : 0.0;
            }
        } catch (Exception e) {
            log.warn("Erreur calcul stock article {} : {}", articleId, e.getMessage());
            return 0.0;
        }
    }

    /**
     * Calcule le stock réservé pour un article.
     */
    private double getStockReserve(Integer articleId) {
        try {
            // Le repository attend depotId mais ne l'utilise pas dans la query
            Double reserved = stockReservationRepository.calculerStockReserve(articleId, null);
            return reserved != null ? reserved : 0.0;
        } catch (Exception e) {
            log.warn("Erreur calcul stock réservé article {} : {}", articleId, e.getMessage());
            return 0.0;
        }
    }
}
