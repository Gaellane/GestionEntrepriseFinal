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
        log.info("Données brutes récupérées: {} lignes", rawData.size());

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
        log.info("Données d'entraînement préparées: {} articles, {} points", result.size(), totalPoints);
        
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
     * - Année (tendance long terme)
     * - Quantité vendue le mois précédent
     * - Quantité vendue le même mois l'année précédente
     * - Moyenne mobile 3 mois
     * - Moyenne mobile 6 mois
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

        // On commence au 7e mois (besoin d'historique 6 mois pour movingAvg6)
        int startIdx = Math.min(6, filledData.size());
        for (int i = startIdx; i < filledData.size(); i++) {
            MonthlyData current = filledData.get(i);
            MonthlyData prev1 = filledData.get(i - 1);
            MonthlyData prev2 = filledData.get(i - 2);
            MonthlyData prev3 = filledData.get(i - 3);

            // Quantité même mois année précédente
            String sameMonthLastYear = (current.annee() - 1) + "-" + current.mois();
            double qtyLastYear = salesIndex.getOrDefault(sameMonthLastYear, 0.0);

            // Moyenne mobile 3 mois
            double movingAvg3 = (prev1.quantite() + prev2.quantite() + prev3.quantite()) / 3.0;

            // Moyenne mobile 6 mois
            double sum6 = 0;
            int count6 = Math.min(6, i);
            for (int j = 1; j <= count6; j++) {
                sum6 += filledData.get(i - j).quantite();
            }
            double movingAvg6 = count6 > 0 ? sum6 / count6 : 0.0;

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
                    .moyenneMobile3Mois(movingAvg3)
                    .moyenneMobile6Mois(movingAvg6)
                    .promotion(0)
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
     * 
     * Utilise des moyennes saisonnières pour que les features varient selon le mois/année ciblé.
     * Pour chaque mois futur, on utilise les données historiques du MÊME mois des années précédentes
     * plutôt que de cascader vers les dernières données globales.
     */
    public double[] buildPredictionFeatures(Integer articleId, int moisCible, int anneeCible, int promotion) {
        List<Object[]> rawData = venteLigneRepository.findVentesMensuellesPourArticle(articleId);

        // Index par "annee-mois" → quantite
        Map<String, Double> salesIndex = new LinkedHashMap<>();
        // Index par mois → liste des quantités historiques (pour moyennes saisonnières)
        Map<Integer, List<Double>> seasonalIndex = new HashMap<>();
        // Index par annee → total des quantités (pour tendance inter-annuelle)
        Map<Integer, Double> yearlyTotals = new TreeMap<>();
        
        for (Object[] row : rawData) {
            int annee = ((Number) row[0]).intValue();
            int mois = ((Number) row[1]).intValue();
            double quantite = ((Number) row[2]).doubleValue();
            salesIndex.put(annee + "-" + mois, quantite);
            seasonalIndex.computeIfAbsent(mois, k -> new ArrayList<>()).add(quantite);
            yearlyTotals.merge(annee, quantite, Double::sum);
        }

        if (salesIndex.isEmpty()) {
            return new double[]{moisCible, anneeCible, 0, 0, 0, 0, promotion, 1.0};
        }

        // === Feature 1: Quantité mois précédent ===
        // Utilise la donnée réelle si disponible, sinon la moyenne saisonnière du mois précédent
        int prevMonth = moisCible == 1 ? 12 : moisCible - 1;
        int prevYear = moisCible == 1 ? anneeCible - 1 : anneeCible;
        double qtyPrevMonth = salesIndex.getOrDefault(prevYear + "-" + prevMonth, 0.0);
        if (qtyPrevMonth == 0) {
            // Utiliser la moyenne saisonnière du mois précédent (même mois, années antérieures)
            List<Double> seasonalPrev = seasonalIndex.getOrDefault(prevMonth, Collections.emptyList());
            qtyPrevMonth = seasonalPrev.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        }

        // === Feature 2: Même mois année précédente ===
        // Cherche le même mois dans les années précédentes (cascade année -1, -2, -3)
        double qtyLastYear = 0;
        for (int delta = 1; delta <= 3 && qtyLastYear == 0; delta++) {
            qtyLastYear = salesIndex.getOrDefault((anneeCible - delta) + "-" + moisCible, 0.0);
        }
        if (qtyLastYear == 0) {
            // Fallback: moyenne saisonnière du même mois
            List<Double> seasonalSame = seasonalIndex.getOrDefault(moisCible, Collections.emptyList());
            qtyLastYear = seasonalSame.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        }

        // === Feature 3: Moyenne mobile 3 mois ===
        // Utilise les 3 mois précédents avec données réelles ou moyennes saisonnières
        double sum3 = 0;
        int count3 = 0;
        for (int i = 1; i <= 3; i++) {
            int m = moisCible - i;
            int y = anneeCible;
            while (m < 1) { m += 12; y--; }
            
            Double val = salesIndex.get(y + "-" + m);
            if (val != null && val > 0) {
                sum3 += val;
                count3++;
            } else {
                // Utiliser la moyenne saisonnière de ce mois
                List<Double> seasonal = seasonalIndex.getOrDefault(m, Collections.emptyList());
                double avg = seasonal.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                if (avg > 0) {
                    sum3 += avg;
                    count3++;
                }
            }
        }
        double movingAvg3 = count3 > 0 ? sum3 / count3 : 0.0;

        // === Feature 4: Moyenne mobile 6 mois ===
        double sum6 = 0;
        int count6 = 0;
        for (int i = 1; i <= 6; i++) {
            int m = moisCible - i;
            int y = anneeCible;
            while (m < 1) { m += 12; y--; }
            
            Double val = salesIndex.get(y + "-" + m);
            if (val != null && val > 0) {
                sum6 += val;
                count6++;
            } else {
                List<Double> seasonal = seasonalIndex.getOrDefault(m, Collections.emptyList());
                double avg = seasonal.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                if (avg > 0) {
                    sum6 += avg;
                    count6++;
                }
            }
        }
        double movingAvg6 = count6 > 0 ? sum6 / count6 : 0.0;

        // === Feature 5: Tendance de croissance ===
        // Calcule la tendance année sur année pour CE mois spécifique
        List<Double> sameMonthHistory = new ArrayList<>();
        for (int y = anneeCible - 5; y < anneeCible; y++) {
            Double val = salesIndex.get(y + "-" + moisCible);
            if (val != null && val > 0) {
                sameMonthHistory.add(val);
            }
        }
        
        double tendance;
        if (sameMonthHistory.size() >= 2) {
            // Tendance = ratio dernière valeur / avant-dernière (croissance mois-spécifique)
            double recent = sameMonthHistory.get(sameMonthHistory.size() - 1);
            double previous = sameMonthHistory.get(sameMonthHistory.size() - 2);
            tendance = previous > 0 ? recent / previous : 1.0;
        } else if (!yearlyTotals.isEmpty()) {
            // Fallback: tendance globale inter-annuelle
            List<Double> yearTotals = new ArrayList<>(yearlyTotals.values());
            if (yearTotals.size() >= 2) {
                double lastYear = yearTotals.get(yearTotals.size() - 1);
                double prevYearTotal = yearTotals.get(yearTotals.size() - 2);
                tendance = prevYearTotal > 0 ? lastYear / prevYearTotal : 1.0;
            } else {
                tendance = 1.0;
            }
        } else {
            tendance = 1.0;
        }

        return new double[]{
                moisCible,
                anneeCible,
                qtyPrevMonth,
                qtyLastYear,
                movingAvg3,
                movingAvg6,
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
