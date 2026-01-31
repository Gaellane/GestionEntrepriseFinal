package com.app.gestion.service;

import com.app.gestion.model.*;
import com.app.gestion.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service de gestion des réservations de stock pour les ventes
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockReservationService {

    private final StockReservationRepository stockReservationRepository;
    private final StockReservationProcessRepository stockReservationProcessRepository;
    private final StockReservationHistoriqueRepository stockReservationHistoriqueRepository;
    private final LotRepository lotRepository;
    private final VenteRepository venteRepository;
    private final VenteLigneRepository venteLigneRepository;

    /**
     * 3.4 - Calculer le stock théorique (somme des quantités restantes dans les
     * lots)
     */
    public Double calculerStockTheorique(Integer articleId, Integer depotId) {
        return lotRepository.calculerStockTheorique(articleId, depotId);
    }

    /**
     * 3.4 - Calculer le stock réservé (réservations actives = non consommées et non
     * libérées)
     */
    public Double calculerStockReserve(Integer articleId, Integer depotId) {
        return stockReservationRepository.calculerStockReserve(articleId, depotId);
    }

    /**
     * 3.4 - Calculer le stock disponible = stock théorique - stock réservé
     */
    public Double calculerStockDisponible(Integer articleId, Integer depotId) {
        Double stockTheorique = calculerStockTheorique(articleId, depotId);
        Double stockReserve = calculerStockReserve(articleId, depotId);

        log.debug("Article {}, Dépôt {}: Stock théorique = {}, Stock réservé = {}",
                articleId, depotId, stockTheorique, stockReserve);

        return stockTheorique - stockReserve;
    }

    /**
     * 3.4 - Vérifier si le stock est suffisant pour une quantité donnée
     * 
     * @return true si stock disponible >= quantité demandée
     */
    public boolean verifierStockDisponible(Integer articleId, Integer depotId, Double quantite) {
        Double stockDisponible = calculerStockDisponible(articleId, depotId);
        return stockDisponible >= quantite;
    }

    /**
     * 3.4 - Vérifier le stock pour toutes les lignes d'une vente
     * 
     * @return Map avec articleId comme clé et message d'erreur si stock insuffisant
     */
    public Map<Integer, String> verifierStockPourVente(Integer venteId, Integer depotId) {
        Map<Integer, String> erreurs = new HashMap<>();

        List<VenteLigne> lignes = venteLigneRepository.findAll().stream()
                .filter(l -> l.getVente().getId().equals(venteId))
                .toList();

        for (VenteLigne ligne : lignes) {
            Integer articleId = ligne.getArticle().getId();
            Double quantiteDemandee = ligne.getQuantite();

            Double stockDisponible = calculerStockDisponible(articleId, depotId);

            if (stockDisponible < quantiteDemandee) {
                String message = String.format(
                        "Stock insuffisant pour l'article %s : disponible = %.2f, demandé = %.2f",
                        ligne.getArticle().getArticleNom(),
                        stockDisponible,
                        quantiteDemandee);
                erreurs.put(articleId, message);
                log.warn(message);
            }
        }

        return erreurs;
    }

    /**
     * 3.3 - Réserver automatiquement le stock pour une vente
     * Crée une réservation par article avec le statut "Réservée" (valeur 10)
     * Note: La base de données ne stocke pas vente_id, depot_id, motif, utilisateur_id
     */
    @Transactional
    public void reserverStockPourVente(Integer venteId, Integer depotId) {
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new RuntimeException("Vente non trouvée: " + venteId));

        // Récupérer le processus "Réservée" (valeur 10)
        StockReservationProcess processReservee = stockReservationProcessRepository.findByValeur(10)
                .orElseThrow(() -> new RuntimeException("Processus 'Réservée' non trouvé"));

        // Générer la référence unique: 'VENTE-' + vente.refe
        String reference = "VENTE-" + vente.getRefe();

        // Grouper les lignes par article et sommer les quantités
        Map<Integer, Double> quantitesParArticle = new HashMap<>();
        List<VenteLigne> lignes = venteLigneRepository.findAll().stream()
                .filter(l -> l.getVente().getId().equals(venteId))
                .toList();

        for (VenteLigne ligne : lignes) {
            Integer articleId = ligne.getArticle().getId();
            Double quantite = ligne.getQuantite();
            quantitesParArticle.merge(articleId, quantite, Double::sum);
        }

        // Créer une réservation par article
        int index = 0;
        for (Map.Entry<Integer, Double> entry : quantitesParArticle.entrySet()) {
            Integer articleId = entry.getKey();
            Double quantiteTotale = entry.getValue();

            Article article = lignes.stream()
                    .filter(l -> l.getArticle().getId().equals(articleId))
                    .findFirst()
                    .map(VenteLigne::getArticle)
                    .orElseThrow(() -> new RuntimeException("Article non trouvé: " + articleId));

            // Référence unique par article: VENTE-CMD-...-001, -002, etc.
            String refArticle = reference + "-" + String.format("%03d", ++index);

            StockReservation reservation = StockReservation.builder()
                    .reference(refArticle)
                    .dateEntree(LocalDateTime.now())
                    .article(article)
                    .quantite(quantiteTotale)
                    .process(processReservee)
                    .build();

            StockReservation savedReservation = stockReservationRepository.save(reservation);

            // 3.3 - Historiser la création de la réservation
            historiserChangementStatut(savedReservation, processReservee);

            log.info("Réservation créée: {} pour article {} - quantité: {}",
                    refArticle, article.getArticleNom(), quantiteTotale);
        }
    }

    /**
     * Changer le statut d'une réservation (Réservée → Allouée → Consommée ou
     * Libérée)
     */
    @Transactional
    public void changerStatutReservation(Integer reservationId, Integer nouvelleValeur, String motif) {
        StockReservation reservation = stockReservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée: " + reservationId));

        StockReservationProcess ancienProcess = reservation.getProcess();

        StockReservationProcess nouveauProcess = stockReservationProcessRepository.findByValeur(nouvelleValeur)
                .orElseThrow(() -> new RuntimeException("Processus non trouvé avec valeur: " + nouvelleValeur));

        // Valider la transition
        validerTransition(ancienProcess.getValeur(), nouvelleValeur);

        reservation.setProcess(nouveauProcess);
        StockReservation updatedReservation = stockReservationRepository.save(reservation);

        // Historiser le changement
        historiserChangementStatut(updatedReservation, nouveauProcess);

        log.info("Réservation {} - Statut changé: {} → {}",
                reservation.getReference(),
                ancienProcess.getProcessName(),
                nouveauProcess.getProcessName());
    }

    /**
     * Valider les transitions de statut autorisées
     */
    private void validerTransition(Integer ancienneValeur, Integer nouvelleValeur) {
        // Réservée (10) → Allouée (20) ou Libérée (99)
        if (ancienneValeur == 10 && !(nouvelleValeur == 20 || nouvelleValeur == 99)) {
            throw new RuntimeException("Transition invalide: Réservée ne peut aller que vers Allouée ou Libérée");
        }

        // Allouée (20) → Consommée (30) ou Libérée (99)
        if (ancienneValeur == 20 && !(nouvelleValeur == 30 || nouvelleValeur == 99)) {
            throw new RuntimeException("Transition invalide: Allouée ne peut aller que vers Consommée ou Libérée");
        }

        // Consommée (30) → Aucune transition possible
        if (ancienneValeur == 30) {
            throw new RuntimeException("Transition invalide: Consommée est un état final");
        }

        // Libérée (99) → Aucune transition possible
        if (ancienneValeur == 99) {
            throw new RuntimeException("Transition invalide: Libérée est un état final");
        }
    }

    /**
     * 3.3 - Historiser un changement de statut dans stock_reservation_historiques
     * Note: La base ne stocke que stock_id, process_id et date_entree
     */
    private void historiserChangementStatut(StockReservation reservation,
            StockReservationProcess nouveauProcess) {

        StockReservationHistorique historique = StockReservationHistorique.builder()
                .stock(reservation)
                .process(nouveauProcess)
                .dateEntree(LocalDateTime.now())
                .build();

        stockReservationHistoriqueRepository.save(historique);
    }

    /**
     * Libérer toutes les réservations d'une vente (passer en statut Libérée = 99)
     * Note: Utilise la référence encodée car la base ne stocke pas vente_id
     */
    @Transactional
    public void libererReservationsVente(Integer venteId, String motif) {
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new RuntimeException("Vente non trouvée: " + venteId));

        String referencePrefix = "VENTE-" + vente.getRefe();
        List<StockReservation> reservations = stockReservationRepository.findByReferenceStartingWith(referencePrefix);

        for (StockReservation reservation : reservations) {
            // Ne libérer que si pas déjà consommée ou libérée
            if (reservation.getProcess().getValeur() != 30 && reservation.getProcess().getValeur() != 99) {
                changerStatutReservation(reservation.getId(), 99, motif);
            }
        }

        log.info("Réservations libérées pour vente {}: {} réservations", vente.getRefe(), reservations.size());
    }
}
