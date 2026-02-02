package com.app.gestion.service;

import java.time.LocalDateTime;
import com.app.gestion.utilitaire.ReferenceGenerator;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.app.gestion.model.Article;
import com.app.gestion.model.AuditLog;
import com.app.gestion.model.Lot;
import com.app.gestion.model.LotMouvement;
import com.app.gestion.model.StockTypeMouvement;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.repository.ActionRepository;
import com.app.gestion.repository.ArticleRepository;
import com.app.gestion.repository.AuditLogRepository;
import com.app.gestion.repository.DepotRepository;
import com.app.gestion.repository.LotMouvementRepository;
import com.app.gestion.repository.LotRepository;
import com.app.gestion.repository.RaisonMouvementRepository;
import com.app.gestion.repository.StockTypeMouvementRepository;
import com.app.gestion.repository.UtilisateurRepository;
import com.app.gestion.exception.InsufficientQuantityException;

import ch.qos.logback.core.joran.action.Action;
import jakarta.transaction.Transactional;


@Service
public class LotService {

    private final RaisonMouvementRepository raisonMouvementRepository;
    private final LotMouvementRepository lotMouvementRepository;
    private final LotRepository lotRepository;
    private final ArticleRepository articleRepository;
    private final DepotRepository depotRepository;
    private final StockTypeMouvementRepository stockTypeMouvementRepository;
    private final AuditLogRepository auditLogRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActionRepository actionRepository;
    private final LotValidationService lotValidationService;

    public LotService(RaisonMouvementRepository raisonMouvementRepository, LotMouvementRepository lotMouvementRepository, LotRepository lotRepository, 
        ArticleRepository articleRepository, DepotRepository depotRepository,
         StockTypeMouvementRepository stockTypeMouvementRepository, AuditLogRepository auditLogRepository, UtilisateurRepository utilisateurRepository, ActionRepository actionRepository,
         LotValidationService lotValidationService) {
        this.raisonMouvementRepository = raisonMouvementRepository;
        this.lotMouvementRepository = lotMouvementRepository;
        this.lotRepository = lotRepository;
        this.articleRepository = articleRepository;
        this.depotRepository = depotRepository;
        this.stockTypeMouvementRepository = stockTypeMouvementRepository;
        this.auditLogRepository = auditLogRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.actionRepository = actionRepository;
        this.lotValidationService = lotValidationService;
    }


    @Transactional
    public List<com.app.gestion.model.LotMouvement> getMouvementsByArticle(Integer articleId) {
        return lotMouvementRepository.findByArticleId(articleId);
    }

    @Transactional
    public List<Lot> transfererLots(Integer articleId, Integer depotSourceId, Integer depotDestId, Double quantite, Integer raisonId, String description,LocalDateTime dateTransfert, Integer userId) throws Exception {
        List<Lot> lots= sortirLots(articleId, quantite, raisonId, description, dateTransfert, userId);
        List<Lot> lotsEntres=new ArrayList<>();
        for(Lot lotSorti : lots){
            // Use the unit price from the lot being transferred for the incoming lot
            Double prix = lotSorti != null ? lotSorti.getPrixUnitaire() : null;
            lotsEntres.add(entrerLot(articleId, depotDestId, lotSorti.getQuantite(), prix, raisonId, description, dateTransfert, lotSorti.getDatePeremption(), userId));
        }
        
        return lotsEntres;
    }

    @Transactional
    public Lot transfererLot(Integer articleId,Integer depotSourceId, Integer depotDestId, Double quantite, Integer raisonId, String description,LocalDateTime dateTransfert, Integer userId) throws Exception {

        Lot lotSorti = sortirLot(articleId, quantite, raisonId, description, dateTransfert, userId);
        // Use the unit price from the lot being transferred for the incoming lot
        Double prix = lotSorti != null ? lotSorti.getPrixUnitaire() : null;
        Lot lotEntre = entrerLot(articleId, depotDestId, quantite, prix, raisonId, description, dateTransfert, lotSorti.getDatePeremption(), userId);

        return lotEntre;
    }


    @Transactional
    public List<Lot> sortirLots(Integer articleId, Double quantite,Integer raisonId, String description,LocalDateTime dateSortie, Integer userId) throws Exception {
        List<Lot> lots=new ArrayList<>();
        List<Lot> candidateLots = getLotsByMethod(articleId, null, quantite, dateSortie);
        double totalAvailable = candidateLots.stream().mapToDouble(l -> l.getQuantiteRestante()).sum();
        if (totalAvailable < quantite) {
            throw new InsufficientQuantityException("Quantité insuffisante en stock");
        }

        for (Lot lot : candidateLots) {
            if (quantite <= 0) {
                break;
            }
            Double qteToSortir = Math.min(lot.getQuantite(), quantite);
            lots.add(sortirLot(lot.getId(), qteToSortir, raisonId, description, dateSortie, userId));
            quantite -= qteToSortir;
        }

        return lots;
    }

    @Transactional
    public Lot sortirLot(Integer lotId, Double quantite, Integer raisonId, String description, LocalDateTime dateSortie, Integer userId) throws Exception {
        // Récupérer le lot existant
        Lot lot = lotRepository.findById(lotId).orElseThrow(() -> new IllegalArgumentException("Lot non trouvé"));

        // Vérifier et bloquer automatiquement si périmé
        boolean estBloque = lotValidationService.verifierEtBloquerLot(lot, dateSortie, userId);
        
        // Vérifier la disponibilité (lèvera une exception si bloqué)
        lotValidationService.verifierDisponibilite(lot);

        // Mettre à jour la quantité du lot
        lot.setQuantiteRestante(lot.getQuantite() - quantite);
        Lot updatedLot = lotRepository.save(lot);

        // Enregistrer le mouvement de lot
        LotMouvement lotMouvement = LotMouvement.builder()
                .lot(updatedLot)
                .quantite(quantite)
                .typeMouvement(stockTypeMouvementRepository.findById(2).orElseThrow(() -> new IllegalArgumentException("Type de mouvement non trouvé"))) // Supposons que StockTypeMouvement est une énumération
                .raison(raisonMouvementRepository.findById(raisonId).orElseThrow(() -> new IllegalArgumentException("Raison de mouvement non trouvée")))
                .dateEntree(dateSortie)
                .description(description)
                .build();

        lotMouvementRepository.save(lotMouvement);

        Utilisateur user= utilisateurRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        AuditLog auditLog = AuditLog.builder()
                .utilisateur(user)
                .action(actionRepository.findById(2).orElseThrow(() -> new IllegalArgumentException("Action non trouvée")))
                .classes("Lot;LotMouvement")
                .idsClasses(updatedLot.getId() + ";" + lotMouvement.getId())
                .newValues(updatedLot.toString()+"\n"+lotMouvement.toString())
                .build();
        auditLogRepository.save(auditLog);
        return updatedLot;
    }


    
    public List<Lot> getLotsByMethod(Integer articleId, Integer depotId, Double quantite) throws Exception {
        return getLotsByMethod(articleId, depotId, quantite, null);
    }

    /**
     * Get candidate lots using valuation method. If dateArriveeCutoff is non-null,
     * only lots with dateArrivee <= cutoff will be considered (ordered by arrival).
     */
    public List<Lot> getLotsByMethod(Integer articleId, Integer depotId, Double quantite, LocalDateTime dateArriveeCutoff) throws Exception {
        Article a = articleRepository.findById(articleId).orElseThrow(() -> new IllegalArgumentException("Article non trouvé"));
        String method = a.getValorisation();

        List<Lot> candidateLots;

        if (dateArriveeCutoff != null) {
            if ("FIFO".equalsIgnoreCase(method)) {
                if (depotId != null) {
                    candidateLots = lotRepository.findByArticleIdAndDepotIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(articleId, depotId, 0.0, dateArriveeCutoff);
                } else {
                    candidateLots = lotRepository.findByArticleIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(articleId, 0.0, dateArriveeCutoff);
                }
            } else if ("LIFO".equalsIgnoreCase(method)) {
                if (depotId != null) {
                    candidateLots = lotRepository.findByArticleIdAndDepotIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeDesc(articleId, depotId, 0.0, dateArriveeCutoff);
                } else {
                    candidateLots = lotRepository.findByArticleIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeDesc(articleId, 0.0, dateArriveeCutoff);
                }
            } else if ("CMUP".equalsIgnoreCase(method)) {
                // For CMUP, use FIFO ordering as selection basis
                if (depotId != null) {
                    candidateLots = lotRepository.findByArticleIdAndDepotIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(articleId, depotId, 0.0, dateArriveeCutoff);
                } else {
                    candidateLots = lotRepository.findByArticleIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(articleId, 0.0, dateArriveeCutoff);
                }
            } else {
                throw new IllegalArgumentException("Méthode de valorisation inconnue : " + method);
            }
        } else {
            // No cutoff: prefer existing repository native methods (they use window functions)
            if ("FIFO".equalsIgnoreCase(method)) {
                candidateLots = lotRepository.findFIFO(articleId, depotId, quantite);
            } else if ("LIFO".equalsIgnoreCase(method)) {
                candidateLots = lotRepository.findLIFO(articleId, depotId, quantite);
            } else if ("CMUP".equalsIgnoreCase(method)) {
                candidateLots = lotRepository.findCMUP(articleId, depotId, quantite);
            } else {
                throw new IllegalArgumentException("Méthode de valorisation inconnue : " + method);
            }
        }

        return candidateLots;
    }



    @Transactional
    public Lot entrerLot(Integer articleId,Integer depotId, Double quantite, Double prixUnitaire, Integer raisonId, String description,LocalDateTime dateEntree, LocalDateTime datePeremption,Integer userId) throws Exception{
        // Créer et enregistrer le lot
        // Generate lot reference using ReferenceGenerator
        String numero = ReferenceGenerator.generateReference("LOT");

        Lot lot = Lot.builder()
                .numero(numero)
                .article(articleRepository.findById(articleId).orElseThrow(() -> new IllegalArgumentException("Article non trouvé")))
                .depot(depotRepository.findById(depotId).orElseThrow(() -> new IllegalArgumentException("Dépôt non trouvé")))
                .quantite(quantite)
                .quantiteRestante(quantite)
                .prixUnitaire(prixUnitaire == null ? 0.0 : prixUnitaire)
                .dateArrivee(dateEntree)
                .datePeremption(datePeremption)
                .build();

        Lot savedLot = lotRepository.save(lot);

        // Enregistrer le mouvement de lot
        LotMouvement lotMouvement = LotMouvement.builder()
                .lot(savedLot)
                .quantite(quantite)
                .typeMouvement(stockTypeMouvementRepository.findById(1).orElseThrow(() -> new IllegalArgumentException("Type de mouvement non trouvé"))) // Supposons que StockTypeMouvement est une énumération
                .raison(raisonMouvementRepository.findById(raisonId).orElseThrow(() -> new IllegalArgumentException("Raison de mouvement non trouvée")))
                .dateEntree(dateEntree)
                .description(description)
                .build();

        lotMouvementRepository.save(lotMouvement);

        Utilisateur user= utilisateurRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        AuditLog auditLog = AuditLog.builder()
                .utilisateur(user)
                .action(actionRepository.findById(1).orElseThrow(() -> new IllegalArgumentException("Action non trouvée")))
                .classes("Lot;LotMouvement")
                .idsClasses(savedLot.getId() + ";" + lotMouvement.getId())
                .newValues(savedLot.toString()+"\n"+lotMouvement.toString())
                .build();
        auditLogRepository.save(auditLog);
        return savedLot;
    }

    /**
     * Sortir définitivement du stock en utilisant les lots sélectionnés par méthode FIFO
     * @param articleId ID de l'article
     * @param quantite Quantité à sortir
     * @param depotId ID du dépôt
     * @param motif Motif de la sortie
     * @return Liste des lots utilisés pour la sortie
     */
    @Transactional
    public List<Lot> sortirStock(Integer articleId, Double quantite, Integer depotId, String motif, Integer raisonId, Integer userId) throws Exception {
        // Récupérer les lots disponibles selon la méthode FIFO
        List<Lot> lotsDisponibles = getLotsByMethod(articleId, depotId, quantite);
        
        if (lotsDisponibles.isEmpty()) {
            throw new InsufficientQuantityException("Aucun lot disponible pour l'article ID " + articleId);
        }
        
        // Vérifier la quantité totale disponible
        Double quantiteTotaleDisponible = lotsDisponibles.stream()
                .mapToDouble(Lot::getQuantiteRestante)
                .sum();
                
        if (quantiteTotaleDisponible < quantite) {
            throw new InsufficientQuantityException(
                String.format("Stock insuffisant. Disponible: %.2f, Demandé: %.2f", 
                             quantiteTotaleDisponible, quantite));
        }
        
        List<Lot> lotsUtilises = new ArrayList<>();
        Double quantiteRestanteASortir = quantite;
        
        // Sortir de chaque lot dans l'ordre FIFO
        for (Lot lot : lotsDisponibles) {
            if (quantiteRestanteASortir <= 0) break;
            
            Double quantiteAPreleversurCeLot = Math.min(quantiteRestanteASortir, lot.getQuantiteRestante());

            // Mettre à jour la quantité restante du lot
            lot.setQuantiteRestante(lot.getQuantiteRestante() - quantiteAPreleversurCeLot);
            lotRepository.save(lot);

            // Enregistrer le mouvement de sortie (avec raisonId et userId)
            enregistrerMouvementSortie(lot, quantiteAPreleversurCeLot, raisonId, motif, userId);
            
            lotsUtilises.add(lot);
            quantiteRestanteASortir -= quantiteAPreleversurCeLot;
        }
        
        return lotsUtilises;
    }

    /**
     * Réserver des lots pour une future sortie (sans modifier les quantités)
     * @param articleId ID de l'article
     * @param quantite Quantité à réserver
     * @param depotId ID du dépôt
     * @param venteId ID de la vente (pour traçabilité)
     * @return Liste des lots réservés
     */
    @Transactional
    public List<Lot> reserverLots(Integer articleId, Double quantite, Integer depotId, Integer venteId, String motif) throws Exception {
        List<Lot> lotsDisponibles = getLotsByMethod(articleId, depotId, quantite);
        
        if (lotsDisponibles.isEmpty()) {
            throw new InsufficientQuantityException("Aucun lot disponible pour réservation article ID " + articleId);
        }
        
        Double quantiteTotaleDisponible = lotsDisponibles.stream()
                .mapToDouble(Lot::getQuantiteRestante)
                .sum();
                
        if (quantiteTotaleDisponible < quantite) {
            throw new InsufficientQuantityException(
                String.format("Stock insuffisant pour réservation. Disponible: %.2f, Demandé: %.2f", 
                             quantiteTotaleDisponible, quantite));
        }
        
        List<Lot> lotsReserves = new ArrayList<>();
        Double quantiteRestanteAReserver = quantite;
        
        // Marquer les lots comme réservés (logique de réservation à implémenter)
        for (Lot lot : lotsDisponibles) {
            if (quantiteRestanteAReserver <= 0) break;
            
            Double quantiteAReserverSurCeLot = Math.min(quantiteRestanteAReserver, lot.getQuantiteRestante());
            
            // TODO: Implémenter la logique de réservation (table de réservation ou champ dans Lot)
            // Pour l'instant, on retourne juste les lots qui seraient utilisés
            
            lotsReserves.add(lot);
            quantiteRestanteAReserver -= quantiteAReserverSurCeLot;
        }
        
        return lotsReserves;
    }

    /**
     * Libérer les réservations pour une vente annulée
     * @param venteId ID de la vente
     */
    @Transactional  
    public void libererReservationsVente(Integer venteId, String motif) {
        // TODO: Implémenter la libération des réservations
        // Requête pour supprimer les réservations liées à cette vente
    }

    /**
     * Enregistrer un mouvement de sortie de lot
     */
    @Transactional
    private void enregistrerMouvementSortie(Lot lot, Double quantite, Integer raisonId, String motif, Integer userId) {
        try {
            StockTypeMouvement typeSortie = stockTypeMouvementRepository.findById(2) // 2 = Sortie
                    .orElseThrow(() -> new IllegalArgumentException("Type mouvement 'Sortie' non trouvé"));

                // Récupérer la raison demandée si fournie, sinon tomber sur la première disponible
                var raison = (raisonId != null) ? raisonMouvementRepository.findById(raisonId).orElse(null) : null;
                if (raison == null) {
                raison = raisonMouvementRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Raison de mouvement non trouvée"));
                }

            LotMouvement mouvement = LotMouvement.builder()
                    .lot(lot)
                    .quantite(quantite)
                    .typeMouvement(typeSortie)
                    .raison(raison)
                    .dateEntree(LocalDateTime.now())
                    .description(motif)
                    .build();

            lotMouvementRepository.save(mouvement);

            // Enregistrer l'audit si l'utilisateur est fourni
            Utilisateur user = null;
            if (userId != null) {
                user = utilisateurRepository.findById(userId).orElse(null);
            }

            AuditLog auditLog = AuditLog.builder()
                    .utilisateur(user)
                    .action(actionRepository.findById(2).orElseThrow(() -> new IllegalArgumentException("Action non trouvée")))
                    .classes("Lot;LotMouvement")
                    .idsClasses(lot.getId() + ";" + mouvement.getId())
                    .newValues(lot.toString() + "\n" + mouvement.toString())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Log l'erreur mais ne pas bloquer la sortie principale
            System.err.println("Erreur enregistrement mouvement: " + e.getMessage());
        }
    }

    /**
     * Sortir du stock en spécifiant la raison et l'utilisateur
     * @param lotId ID du lot
     * @param quantite Quantité à sortir
     * @param motif Description de la sortie
     * @param raisonId ID de la raison (peut être null, utilisera la première disponible)
     * @param userId ID de l'utilisateur (peut être null)
     */
    @Transactional
    public void sortirStock(Integer lotId, Double quantite, String motif, Integer raisonId, Integer userId) {
        Lot lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new IllegalArgumentException("Lot non trouvé: " + lotId));

        if (lot.getQuantiteRestante() < quantite) {
            throw new InsufficientQuantityException(
                String.format("Stock insuffisant dans le lot %s. Disponible: %.2f, Demandé: %.2f", 
                             lot.getNumero(), lot.getQuantiteRestante(), quantite));
        }

        // Mettre à jour la quantité restante
        lot.setQuantiteRestante(lot.getQuantiteRestante() - quantite);
        lotRepository.save(lot);

        // Enregistrer le mouvement
        enregistrerMouvementSortie(lot, quantite, raisonId, motif, userId);
    }

}
