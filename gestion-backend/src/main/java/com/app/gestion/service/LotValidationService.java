package com.app.gestion.service;

import com.app.gestion.model.Lot;
import com.app.gestion.model.Categorie;
import com.app.gestion.model.AuditLog;
import com.app.gestion.model.enums.StatutLot;
import com.app.gestion.repository.LotRepository;
import com.app.gestion.repository.AuditLogRepository;
import com.app.gestion.repository.ActionRepository;
import com.app.gestion.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service de validation et de blocage automatique des lots selon leur date de péremption
 */
@Service
public class LotValidationService {

    private final LotRepository lotRepository;
    private final AuditLogRepository auditLogRepository;
    private final ActionRepository actionRepository;
    private final UtilisateurRepository utilisateurRepository;

    public LotValidationService(LotRepository lotRepository, 
                                AuditLogRepository auditLogRepository,
                                ActionRepository actionRepository,
                                UtilisateurRepository utilisateurRepository) {
        this.lotRepository = lotRepository;
        this.auditLogRepository = auditLogRepository;
        this.actionRepository = actionRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    /**
     * Vérifie et met à jour le statut d'un lot en fonction de sa date de péremption
     * et des paramètres DLUO/DLC de sa catégorie, par rapport à une date de référence
     * 
     * @param lot Lot à vérifier
     * @param dateReference Date de référence (date du mouvement/inventaire)
     * @param userId ID de l'utilisateur effectuant l'opération
     * @return true si le lot est bloqué (DLC expirée), false sinon
     */
    @Transactional
    public boolean verifierEtBloquerLot(Lot lot, LocalDateTime dateReference, Integer userId) {
        if (lot == null || lot.getDatePeremption() == null) {
            return false;
        }

        // Récupérer les paramètres DLUO/DLC depuis la catégorie de l'article
        Categorie categorie = lot.getArticle() != null ? lot.getArticle().getCategorie() : null;
        if (categorie == null) {
            return false;
        }

        Integer dlc = categorie.getDlc();
        Integer dluo = categorie.getDluo();

        // Si ni DLC ni DLUO configurés, pas de gestion de péremption
        if (dlc == null && dluo == null) {
            return false;
        }

        // Vérifier si la date de péremption est dépassée
        if (lot.getDatePeremption().isBefore(dateReference)) {
            StatutLot ancienStatut = lot.getStatutLot();
            
            if (dlc != null && dlc > 0) {
                // DLC configurée et dépassée = blocage automatique
                lot.setStatutLot(StatutLot.EXPIRE_DLC);
                lot.setRaisonBlocage("DLC expirée le " + lot.getDatePeremption().toLocalDate());
                lot.setDateBlocage(dateReference);
                lotRepository.save(lot);
                
                // Enregistrer le log d'audit
                enregistrerLog(lot, "Blocage automatique: DLC expirée", ancienStatut.toString(), StatutLot.EXPIRE_DLC.toString(), userId);
                
                return true; // Lot bloqué
            } else if (dluo != null && dluo > 0) {
                // DLUO configurée et dépassée = alerte mais pas de blocage
                lot.setStatutLot(StatutLot.EXPIRE_DLUO);
                lot.setRaisonBlocage("DLUO dépassée le " + lot.getDatePeremption().toLocalDate());
                lot.setDateBlocage(dateReference);
                lotRepository.save(lot);
                
                // Enregistrer le log d'audit
                enregistrerLog(lot, "Alerte: DLUO dépassée", ancienStatut.toString(), StatutLot.EXPIRE_DLUO.toString(), userId);
                
                return false; // Lot utilisable mais avec alerte
            }
        }

        return false;
    }

    /**
     * Vérifie si un lot peut être utilisé pour une sortie
     * 
     * @param lot Lot à vérifier
     * @throws IllegalStateException si le lot est bloqué
     */
    public void verifierDisponibilite(Lot lot) {
        if (lot.getStatutLot() == StatutLot.BLOQUE || lot.getStatutLot() == StatutLot.EXPIRE_DLC) {
            throw new IllegalStateException("Lot " + lot.getNumero() + " bloqué: " + lot.getRaisonBlocage());
        }
    }

    /**
     * Bloque manuellement un lot (pour non-conformité par exemple)
     * 
     * @param lot Lot à bloquer
     * @param raison Raison du blocage
     * @param userId ID de l'utilisateur effectuant le blocage
     */
    @Transactional
    public void bloquerManuellement(Lot lot, String raison, Integer userId) {
        StatutLot ancienStatut = lot.getStatutLot();
        
        lot.setStatutLot(StatutLot.BLOQUE);
        lot.setRaisonBlocage(raison);
        lot.setDateBlocage(LocalDateTime.now());
        lotRepository.save(lot);
        
        // Enregistrer le log d'audit
        enregistrerLog(lot, "Blocage manuel: " + raison, ancienStatut.toString(), StatutLot.BLOQUE.toString(), userId);
    }

    /**
     * Débloque un lot (action manuelle avec autorisation)
     * 
     * @param lot Lot à débloquer
     * @param userId ID de l'utilisateur effectuant le déblocage
     */
    @Transactional
    public void debloquer(Lot lot, Integer userId) {
        StatutLot ancienStatut = lot.getStatutLot();
        String ancienneRaison = lot.getRaisonBlocage();
        
        lot.setStatutLot(StatutLot.ACTIF);
        lot.setRaisonBlocage(null);
        lot.setDateBlocage(null);
        lotRepository.save(lot);
        
        // Enregistrer le log d'audit
        enregistrerLog(lot, "Déblocage manuel (ancienne raison: " + ancienneRaison + ")", 
                       ancienStatut.toString(), StatutLot.ACTIF.toString(), userId);
    }

    /**
     * Enregistre un log d'audit pour une action sur un lot
     */
    private void enregistrerLog(Lot lot, String description, String oldValue, String newValue, Integer userId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .utilisateur(utilisateurRepository.findById(userId).orElse(null))
                    .action(actionRepository.findById(2).orElse(null)) // Action "Modification"
                    .classes("Lot")
                    .idsClasses(lot.getId().toString())
                    .oldValues("statutLot=" + oldValue)
                    .newValues("statutLot=" + newValue + ", raison=" + lot.getRaisonBlocage())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Log l'erreur mais ne pas bloquer l'opération principale
            System.err.println("Erreur lors de l'enregistrement du log d'audit: " + e.getMessage());
        }
    }
}
