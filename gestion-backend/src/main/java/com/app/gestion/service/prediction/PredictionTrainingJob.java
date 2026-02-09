package com.app.gestion.service.prediction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job planifié pour le réentraînement périodique des modèles de prédiction.
 *
 * Par défaut, l'entraînement se lance tous les dimanches à 2h du matin.
 * Configurable via la propriété `prediction.training.cron`.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PredictionTrainingJob {

    private final ModelTrainingService modelTrainingService;

    /**
     * Réentraîne tous les modèles une fois par semaine.
     * Cron: chaque dimanche à 02:00.
     */
    @Scheduled(cron = "${prediction.training.cron:0 0 2 * * SUN}")
    public void scheduledTraining() {
        log.info("Début de l'entraînement planifié des modèles de prédiction...");
        try {
            modelTrainingService.trainAllModels();
            log.info("Entraînement planifié terminé avec succès.");
        } catch (Exception e) {
            log.error("Échec de l'entraînement planifié", e);
        }
    }
}
