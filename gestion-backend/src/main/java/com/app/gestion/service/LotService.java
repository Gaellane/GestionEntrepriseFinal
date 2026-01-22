package com.app.gestion.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;

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

    public LotService(RaisonMouvementRepository raisonMouvementRepository, LotMouvementRepository lotMouvementRepository, LotRepository lotRepository, 
        ArticleRepository articleRepository, DepotRepository depotRepository,
         StockTypeMouvementRepository stockTypeMouvementRepository, AuditLogRepository auditLogRepository, UtilisateurRepository utilisateurRepository, ActionRepository actionRepository) {
        this.raisonMouvementRepository = raisonMouvementRepository;
        this.lotMouvementRepository = lotMouvementRepository;
        this.lotRepository = lotRepository;
        this.articleRepository = articleRepository;
        this.depotRepository = depotRepository;
        this.stockTypeMouvementRepository = stockTypeMouvementRepository;
        this.auditLogRepository = auditLogRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.actionRepository = actionRepository;
    }


    @Transactional
    public List<Lot> transfererLots(Integer articleId, Integer depotSourceId, Integer depotDestId, Double quantite, Integer raisonId, String description,LocalDateTime dateTransfert, Integer userId) throws Exception {
        List<Lot> lots=new ArrayList<>();
        List<Lot> candidateLots = getLotsByMethod(articleId, depotSourceId, quantite);
        double totalAvailable = candidateLots.stream().mapToDouble(l -> l.getQuantite()).sum();
        if (totalAvailable < quantite) {
            throw new InsufficientQuantityException("Quantité insuffisante en stock");
        }

        for (Lot lot : candidateLots) {
            if (quantite <= 0) {
                break;
            }
            Double qteToTransferer = Math.min(lot.getQuantite(), quantite);
            lots.add(transfererLot(lot.getId(), depotSourceId, depotDestId, qteToTransferer, raisonId, description, dateTransfert, userId));
            quantite -= qteToTransferer;
        }
        
        return lots;
    }

    @Transactional
    public Lot transfererLot(Integer articleId,Integer depotSourceId, Integer depotDestId, Double quantite, Integer raisonId, String description,LocalDateTime dateTransfert, Integer userId) throws Exception {

        Lot lotSorti = sortirLot(articleId, quantite, raisonId, description, dateTransfert, userId);
        Lot lotEntre = entrerLot(articleId, depotDestId, quantite, raisonId, description, dateTransfert, lotSorti.getDatePeremption(), userId);

        return lotEntre;
    }


    @Transactional
    public List<Lot> sortirLots(Integer articleId, Double quantite,Integer raisonId, String description,LocalDateTime dateSortie, Integer userId) throws Exception {
        List<Lot> lots=new ArrayList<>();
        List<Lot> candidateLots = getLotsByMethod(articleId, null, quantite);
        double totalAvailable = candidateLots.stream().mapToDouble(l -> l.getQuantite()).sum();
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

        if (lot.getQuantite() < quantite) {
            throw new IllegalArgumentException("Quantité insuffisante dans le lot");
        }

        // Mettre à jour la quantité du lot
        lot.setQuantite(lot.getQuantite() - quantite);
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
        Article a = articleRepository.findById(articleId).orElseThrow(() -> new IllegalArgumentException("Article non trouvé"));
        String method = a.getValorisation();
        if ("FIFO".equalsIgnoreCase(method)) {
            return lotRepository.findFIFO(articleId, depotId, quantite);
        } else if ("LIFO".equalsIgnoreCase(method)) {
            return lotRepository.findLIFO(articleId, depotId, quantite);
        } else if("CMUP".equalsIgnoreCase(method)) {
            return lotRepository.findCMUP(articleId, depotId, quantite);
        } else {
            throw new IllegalArgumentException("Méthode de valorisation inconnue : " + method);
        }
    }



    @Transactional
    public Lot entrerLot(Integer articleId,Integer depotId, Double quantite, Integer raisonId, String description,LocalDateTime dateEntree, LocalDateTime datePeremption,Integer userId) throws Exception{
        // Créer et enregistrer le lot
        // Generate sequential lot number using DB sequence (lot_num_seq)
        Long seq = null;
        try {
            seq = lotRepository.getNextLotSequence();
        } catch (Exception e) {
            throw new Exception("Erreur lors de la génération du numéro de lot : " + e.getMessage());
        }

        String numero = String.format("LOT%03d", seq);

        Lot lot = Lot.builder()
                .numero(numero)
                .article(articleRepository.findById(articleId).orElseThrow(() -> new IllegalArgumentException("Article non trouvé")))
                .depot(depotRepository.findById(depotId).orElseThrow(() -> new IllegalArgumentException("Dépôt non trouvé")))
                .quantite(quantite)
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
