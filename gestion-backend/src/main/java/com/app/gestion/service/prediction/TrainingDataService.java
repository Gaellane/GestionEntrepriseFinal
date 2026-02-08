package com.app.gestion.service.prediction;

import com.app.gestion.dto.prediction.TrainingDataPoint;
import com.app.gestion.repository.VenteLigneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service responsable de la préparation des données d'entraînement
 * à partir des données historiques de ventes de l'ERP.
 *
 * Extrait les données de VenteLigne, les agrège par mois/article,
 * et construit les features nécessaires au modèle ML.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingDataService {

    private final VenteLigneRepository venteLigneRepository;

    /**
     * Prépare les données d'entraînement pour tous les articles ayant un historique de ventes.
     *
     * @return Map articleId -> Liste de TrainingDataPoint
     */
    public Map<Integer, List<TrainingDataPoint>> prepareTrainingData() {
        log.info("Début de la préparation des données d'entraînement...");

        // Récupère toutes les ventes mensuelles agrégées
        List<Object[]> rawData = venteLigneRepository.findVentesMensuellesParArticle();

        // Regroupe par articleId
        Map<Integer, List<MonthlyData>> dataByArticle = new LinkedHashMap<>();
        for (Object[] row : rawData) {
            Integer articleId = ((Number) row[0]).intValue();
            int annee = ((Number) row[1]).intValue();
            int mois = ((Number) row[2]).intValue();
            double quantite = ((Number) row[3]).doubleValue();

            dataByArticle
                    .computeIfAbsent(articleId, k -> new ArrayList<>())
                    .add(new MonthlyData(annee, mois, quantite));
        }

        // Construit les features pour chaque article
        Map<Integer, List<TrainingDataPoint>> result = new LinkedHashMap<>();
        for (Map.Entry<Integer, List<MonthlyData>> entry : dataByArticle.entrySet()) {
            Integer articleId = entry.getKey();
            List<MonthlyData> monthlyDataList = entry.getValue();

            List<TrainingDataPoint> points = buildFeatures(articleId, monthlyDataList);
            if (!points.isEmpty()) {
                result.put(articleId, points);
            }
        }

        int totalPoints = result.values().stream().mapToInt(List::size).sum();
        log.info("Données d'entraînement préparées : {} articles, {} points de données",
                result.size(), totalPoints);

        return result;
    }

    /**
     * Prépare les données d'entraînement pour un article spécifique.
     */
    public List<TrainingDataPoint> prepareTrainingDataForArticle(Integer articleId) {
        List<Object[]> rawData = venteLigneRepository.findVentesMensuellesPourArticle(articleId);

        List<MonthlyData> monthlyDataList = rawData.stream()
                .map(row -> new MonthlyData(
                        ((Number) row[0]).intValue(),
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).doubleValue()))
                .collect(Collectors.toList());

        return buildFeatures(articleId, monthlyDataList);
    }

    /**
     * Construit les features à partir des données mensuelles brutes.
     * Pour chaque mois, calcule :
     * - Quantité vendue le mois précédent
     * - Quantité vendue le même mois l'année précédente
     * - Moyenne mobile 3 mois
     * - Tendance de croissance
     */
    private List<TrainingDataPoint> buildFeatures(Integer articleId, List<MonthlyData> data) {
        if (data.size() < 3) {
            log.debug("Pas assez de données pour l'article {} ({} mois)", articleId, data.size());
            return Collections.emptyList();
        }

        // Trie par année et mois
        data.sort(Comparator.comparingInt(MonthlyData::annee)
                .thenComparingInt(MonthlyData::mois));

        // Crée un index pour accéder rapidement aux données par (annee, mois)
        Map<String, Double> salesIndex = new HashMap<>();
        for (MonthlyData md : data) {
            salesIndex.put(md.annee() + "-" + md.mois(), md.quantite());
        }

        // Remplit les mois manquants entre le premier et le dernier mois
        List<MonthlyData> filledData = fillMissingMonths(data);

        List<TrainingDataPoint> points = new ArrayList<>();

        // On commence au 4e mois (besoin d'historique 3 mois)
        for (int i = 3; i < filledData.size(); i++) {
            MonthlyData current = filledData.get(i);
            MonthlyData prev1 = filledData.get(i - 1);
            MonthlyData prev2 = filledData.get(i - 2);
            MonthlyData prev3 = filledData.get(i - 3);

            // Quantité même mois année précédente
            String sameMonthLastYear = (current.annee() - 1) + "-" + current.mois();
            double qtyLastYear = salesIndex.getOrDefault(sameMonthLastYear, 0.0);

            // Moyenne mobile 3 mois
            double movingAvg = (prev1.quantite() + prev2.quantite() + prev3.quantite()) / 3.0;

            // Tendance de croissance
            double tendance = prev2.quantite() > 0
                    ? prev1.quantite() / prev2.quantite()
                    : 1.0;

            points.add(TrainingDataPoint.builder()
                    .articleId(articleId)
                    .mois(current.mois())
                    .annee(current.annee())
                    .quantiteMoisPrecedent(prev1.quantite())
                    .quantiteMemesMoisAnneePrecedente(qtyLastYear)
                    .moyenneMobile3Mois(movingAvg)
                    .promotion(0) // Par défaut pas de promotion, extensible
                    .tendanceCroissance(tendance)
                    .quantiteVendue(current.quantite())
                    .build());
        }

        return points;
    }

    /**
     * Remplit les mois manquants avec quantité 0 pour avoir une série continue.
     */
    private List<MonthlyData> fillMissingMonths(List<MonthlyData> data) {
        if (data.isEmpty()) return data;

        List<MonthlyData> filled = new ArrayList<>();
        MonthlyData first = data.get(0);
        MonthlyData last = data.get(data.size() - 1);

        Map<String, Double> index = new HashMap<>();
        for (MonthlyData md : data) {
            index.put(md.annee() + "-" + md.mois(), md.quantite());
        }

        int year = first.annee();
        int month = first.mois();

        while (year < last.annee() || (year == last.annee() && month <= last.mois())) {
            String key = year + "-" + month;
            double qty = index.getOrDefault(key, 0.0);
            filled.add(new MonthlyData(year, month, qty));

            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
        }

        return filled;
    }

    /**
     * Construit les features pour une prédiction future (sans label connu).
     */
    public double[] buildPredictionFeatures(Integer articleId, int moisCible, int anneeCible, int promotion) {
        List<Object[]> rawData = venteLigneRepository.findVentesMensuellesPourArticle(articleId);

        Map<String, Double> salesIndex = new HashMap<>();
        for (Object[] row : rawData) {
            int annee = ((Number) row[0]).intValue();
            int mois = ((Number) row[1]).intValue();
            double quantite = ((Number) row[2]).doubleValue();
            salesIndex.put(annee + "-" + mois, quantite);
        }

        // Mois précédent
        int prevMonth = moisCible == 1 ? 12 : moisCible - 1;
        int prevYear = moisCible == 1 ? anneeCible - 1 : anneeCible;
        double qtyPrevMonth = salesIndex.getOrDefault(prevYear + "-" + prevMonth, 0.0);

        // Même mois année précédente
        double qtyLastYear = salesIndex.getOrDefault((anneeCible - 1) + "-" + moisCible, 0.0);

        // Moyenne mobile 3 mois
        double sum3 = 0;
        int m = moisCible;
        int y = anneeCible;
        for (int i = 0; i < 3; i++) {
            m--;
            if (m < 1) { m = 12; y--; }
            sum3 += salesIndex.getOrDefault(y + "-" + m, 0.0);
        }
        double movingAvg = sum3 / 3.0;

        // Tendance
        int prev2Month = prevMonth == 1 ? 12 : prevMonth - 1;
        int prev2Year = prevMonth == 1 ? prevYear - 1 : prevYear;
        double qtyPrev2Month = salesIndex.getOrDefault(prev2Year + "-" + prev2Month, 0.0);
        double tendance = qtyPrev2Month > 0 ? qtyPrevMonth / qtyPrev2Month : 1.0;

        return new double[]{
                moisCible,
                qtyPrevMonth,
                qtyLastYear,
                movingAvg,
                promotion,
                tendance
        };
    }

    /**
     * Récupère la liste des articles ayant un historique de ventes.
     */
    public List<Integer> getArticlesAvecVentes() {
        return venteLigneRepository.findArticlesAvecVentes();
    }

    /**
     * Données mensuelles internes.
     */
    private record MonthlyData(int annee, int mois, double quantite) {}
}
