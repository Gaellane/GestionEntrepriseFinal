package com.app.gestion.service;

import java.time.LocalDateTime;
import com.app.gestion.utilitaire.ReferenceGenerator;
import java.util.ArrayList;
import java.util.List;

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

        // When a cutoff is provided, use derived query methods that filter by dateArrivee
        if (dateArriveeCutoff != null) {
            if ("FIFO".equalsIgnoreCase(method)) {
                if (depotId != null) {
                    return lotRepository.findByArticleIdAndDepotIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(articleId, depotId, 0.0, dateArriveeCutoff);
                } else {
                    return lotRepository.findByArticleIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(articleId, 0.0, dateArriveeCutoff);
                }
            } else if ("LIFO".equalsIgnoreCase(method)) {
                if (depotId != null) {
                    return lotRepository.findByArticleIdAndDepotIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeDesc(articleId, depotId, 0.0, dateArriveeCutoff);
                } else {
                    return lotRepository.findByArticleIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeDesc(articleId, 0.0, dateArriveeCutoff);
                }
            } else if ("CMUP".equalsIgnoreCase(method)) {
                // For CMUP, use FIFO ordering as selection basis
                if (depotId != null) {
                    return lotRepository.findByArticleIdAndDepotIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(articleId, depotId, 0.0, dateArriveeCutoff);
                } else {
                    return lotRepository.findByArticleIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(articleId, 0.0, dateArriveeCutoff);
                }
            } else {
                throw new IllegalArgumentException("Méthode de valorisation inconnue : " + method);
            }
        }

        // No cutoff: prefer existing repository native methods (they use window functions)
        if ("FIFO".equalsIgnoreCase(method)) {
            return lotRepository.findFIFO(articleId, depotId, quantite);
        } else if ("LIFO".equalsIgnoreCase(method)) {
            return lotRepository.findLIFO(articleId, depotId, quantite);
        } else if ("CMUP".equalsIgnoreCase(method)) {
            return lotRepository.findCMUP(articleId, depotId, quantite);
        } else {
            throw new IllegalArgumentException("Méthode de valorisation inconnue : " + method);
        }
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

}
