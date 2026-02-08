package com.app.gestion.controller;

import com.app.gestion.dto.prediction.PredictionSummaryDto;
import com.app.gestion.dto.prediction.SalesPredictionRequestDto;
import com.app.gestion.dto.prediction.SalesPredictionResponseDto;
import com.app.gestion.service.prediction.StockPredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour les prédictions de ventes et alertes de stock.
 *
 * Endpoints :
 * - POST /api/predictions/train       → Déclencher l'entraînement du modèle
 * - GET  /api/predictions/model-info   → Informations sur le modèle
 * - POST /api/predictions/article      → Prédiction pour un article
 * - GET  /api/predictions/all          → Prédictions pour tous les articles
 * - GET  /api/predictions/alertes      → Alertes de rupture
 */
@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@Slf4j
public class PredictionController {

    private final StockPredictionService stockPredictionService;

    /**
     * Déclenche l'entraînement (ou le réentraînement) des modèles de prédiction.
     * Opération batch, peut prendre quelques secondes.
     */
    @PostMapping("/train")
    public ResponseEntity<Map<String, Object>> trainModel() {
        log.info("Demande d'entraînement des modèles de prédiction");
        long start = System.currentTimeMillis();

        try {
            stockPredictionService.triggerTraining();
            long duration = System.currentTimeMillis() - start;

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Modèles entraînés avec succès",
                    "durationMs", duration
            ));
        } catch (Exception e) {
            log.error("Erreur lors de l'entraînement", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Erreur lors de l'entraînement : " + e.getMessage()
            ));
        }
    }

    /**
     * Retourne les informations du modèle (date d'entraînement, métriques, etc.)
     */
    @GetMapping("/model-info")
    public ResponseEntity<PredictionSummaryDto> getModelInfo() {
        return ResponseEntity.ok(stockPredictionService.getModelInfo());
    }

    /**
     * Prédit les ventes pour un article spécifique.
     */
    @PostMapping("/article")
    public ResponseEntity<SalesPredictionResponseDto> predictForArticle(
            @RequestBody SalesPredictionRequestDto request) {

        log.info("Prédiction demandée pour article {} - {}/{}", 
                request.getArticleId(), request.getMoisCible(), request.getAnneeCible());

        try {
            SalesPredictionResponseDto response = stockPredictionService.predictForArticle(request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.warn("Modèle non disponible : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            log.warn("Article introuvable : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Prédit les ventes pour tous les articles ayant un historique.
     *
     * @param mois  Mois cible (1-12), défaut : mois suivant
     * @param annee Année cible, défaut : année courante
     */
    @GetMapping("/all")
    public ResponseEntity<PredictionSummaryDto> predictAll(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {

        LocalDate now = LocalDate.now();
        int moisCible = mois != null ? mois : (now.getMonthValue() % 12) + 1;
        int anneeCible = annee != null ? annee : (moisCible == 1 ? now.getYear() + 1 : now.getYear());

        log.info("Prédictions globales demandées pour {}/{}", moisCible, anneeCible);

        try {
            PredictionSummaryDto summary = stockPredictionService.predictAllArticles(moisCible, anneeCible);
            return ResponseEntity.ok(summary);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(
                    PredictionSummaryDto.builder()
                            .modeleDisponible(false)
                            .build());
        }
    }

    /**
     * Retourne les alertes de rupture de stock prédites.
     *
     * @param mois  Mois cible (1-12)
     * @param annee Année cible
     */
    @GetMapping("/alertes")
    public ResponseEntity<List<SalesPredictionResponseDto>> getAlertes(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {

        LocalDate now = LocalDate.now();
        int moisCible = mois != null ? mois : (now.getMonthValue() % 12) + 1;
        int anneeCible = annee != null ? annee : (moisCible == 1 ? now.getYear() + 1 : now.getYear());

        try {
            List<SalesPredictionResponseDto> alertes = 
                    stockPredictionService.getAlertesRupture(moisCible, anneeCible);
            return ResponseEntity.ok(alertes);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
