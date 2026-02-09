package com.app.gestion.service;

import com.app.gestion.model.CaisseMouvement;
import com.app.gestion.model.CaisseTypeMouvement;
import com.app.gestion.model.Entity;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.model.Vente;
import com.app.gestion.repository.CaisseMouvementRepository;
import com.app.gestion.repository.CaisseTypeMouvementRepository;
import com.app.gestion.repository.EntityRepository;
import com.app.gestion.repository.UtilisateurRepository;
import com.app.gestion.repository.VenteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaisseMouvementService {

    private final CaisseMouvementRepository caisseMouvementRepository;
    private final CaisseTypeMouvementRepository caisseTypeMouvementRepository;
    private final VenteRepository venteRepository;
    private final EntityRepository entityRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Encaisser une vente - créer un mouvement de caisse
     */
    @Transactional
    public CaisseMouvement encaisserVente(Integer venteId, Double montant, Integer typeMouvementId, Integer entityId,
            String details) {
        // Vérifier que la vente existe
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new RuntimeException("Vente introuvable: " + venteId));

        // Vérifier que la vente est validée (process >= 60)
        if (vente.getProcess() == null || vente.getProcess().getValeur() < 60) {
            throw new RuntimeException("La vente doit être validée avant encaissement");
        }

        // Déterminer le montant (par défaut le prix total de la vente)
        Double montantFinal = montant != null ? montant : vente.getPrixTotal();

        // Déterminer le type de mouvement (par défaut premier type positif trouvé)
        CaisseTypeMouvement type = null;
        if (typeMouvementId != null) {
            type = caisseTypeMouvementRepository.findById(typeMouvementId)
                    .orElseThrow(() -> new RuntimeException("Type de mouvement introuvable: " + typeMouvementId));
        } else {
            Optional<CaisseTypeMouvement> opt = caisseTypeMouvementRepository.findAll().stream()
                    .filter(t -> t.getValeur() != null && t.getValeur() > 0)
                    .findFirst();
            type = opt.orElseThrow(() -> new RuntimeException("Aucun type d'encaissement trouvé"));
        }

        // Déterminer l'entité (depuis l'utilisateur connecté)
        Entity entity = getCurrentUserEntity();

        // Créer le mouvement de caisse
        CaisseMouvement cm = CaisseMouvement.builder()
                .montant(montantFinal)
                .typeMouvement(type)
                .dateEntree(LocalDateTime.now())
                .entity(entity)
                .details("Encaissement vente " + vente.getRefe() + (details != null ? (" - " + details) : ""))
                .build();

        CaisseMouvement saved = caisseMouvementRepository.save(cm);
        log.info("Encaissement enregistré pour vente {} : {} Ar", vente.getRefe(), montantFinal);

        return saved;
    }

    /**
     * Créer un mouvement de caisse générique (vente optionnelle)
     */
    @Transactional
    public CaisseMouvement createMouvement(Integer venteId, Double montant, Integer typeMouvementId, Integer entityId,
            String details) {
        String detailsFinal = details != null ? details : "";

        // Si une vente est fournie, tenter de l'utiliser pour enrichir les détails
        if (venteId != null) {
            Vente vente = venteRepository.findById(venteId)
                    .orElseThrow(() -> new RuntimeException("Vente introuvable: " + venteId));
            detailsFinal = "Vente " + vente.getRefe() + (detailsFinal.isEmpty() ? "" : " - " + detailsFinal);
        }

        // Déterminer le montant
        Double montantFinal = montant != null ? montant : 0.0;

        // Déterminer le type de mouvement
        CaisseTypeMouvement type = null;
        if (typeMouvementId != null) {
            type = caisseTypeMouvementRepository.findById(typeMouvementId)
                    .orElseThrow(() -> new RuntimeException("Type de mouvement introuvable: " + typeMouvementId));
        } else {
            // Par défaut, utiliser le premier type (positif ou négatif selon montant)
            Optional<CaisseTypeMouvement> opt = caisseTypeMouvementRepository.findAll().stream().findFirst();
            type = opt.orElseThrow(() -> new RuntimeException("Aucun type de mouvement trouvé"));
        }

        // Déterminer l'entité (depuis l'utilisateur connecté)
        Entity entity = getCurrentUserEntity();

        CaisseMouvement cm = CaisseMouvement.builder()
                .montant(montantFinal)
                .typeMouvement(type)
                .dateEntree(LocalDateTime.now())
                .entity(entity)
                .details(detailsFinal)
                .build();

        CaisseMouvement saved = caisseMouvementRepository.save(cm);
        log.info("Mouvement de caisse créé: {} Ar - {}", montantFinal, detailsFinal);
        return saved;
    }

    /**
     * Récupérer tous les mouvements de caisse liés à une vente
     */
    @Transactional(readOnly = true)
    public List<CaisseMouvement> getMouvementsByVente(Integer venteId) {
        // Vérifier que la vente existe
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new RuntimeException("Vente introuvable: " + venteId));

        // Rechercher dans les détails les mouvements qui mentionnent cette vente
        return caisseMouvementRepository.findAll().stream()
                .filter(cm -> cm.getDetails() != null && cm.getDetails().contains("vente " + vente.getRefe()))
                .toList();
    }

    /**
     * Récupérer tous les mouvements de caisse
     */
    @Transactional(readOnly = true)
    public List<CaisseMouvement> getAllMouvements() {
        return caisseMouvementRepository.findAll();
    }

    /**
     * Encaissements sur une période
     */
    @Transactional(readOnly = true)
    public Double getEncaissements(LocalDateTime dateDebut, LocalDateTime dateFin) {
        return caisseMouvementRepository.sumEncaissements(dateDebut, dateFin);
    }

    /**
     * Remboursements sur une période
     */
    @Transactional(readOnly = true)
    public Double getRemboursements(LocalDateTime dateDebut, LocalDateTime dateFin) {
        return caisseMouvementRepository.sumRemboursements(dateDebut, dateFin);
    }

    /**
     * Mouvements agrégés par type sur une période
     */
    @Transactional(readOnly = true)
    public List<Object[]> getMouvementsParType(LocalDateTime dateDebut, LocalDateTime dateFin) {
        return caisseMouvementRepository.sumByTypeMouvement(dateDebut, dateFin);
    }

    /**
     * Récupérer l'entité de l'utilisateur connecté
     */
    private Entity getCurrentUserEntity() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur user = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + username));
        return user.getEntity();
    }

    public Double getMontantEnCaisse() throws Exception {
        CaisseTypeMouvement typeEntree = caisseTypeMouvementRepository.findById(1)
                .orElseThrow(() -> new Exception("Donnees sur les types de mouvements non inserees ! Corrigez cela "));
        CaisseTypeMouvement typeSortie = caisseTypeMouvementRepository.findById(2)
                .orElseThrow(() -> new Exception("Donnees sur les types de mouvements non inserees ! Corrigez cela "));
        Double entree = caisseMouvementRepository.findMontantTotalByMouvementId(typeEntree.getId()) != null
                ? caisseMouvementRepository.findMontantTotalByMouvementId(typeEntree.getId())
                : 0;
        Double sortie = caisseMouvementRepository.findMontantTotalByMouvementId(typeSortie.getId()) != null
                ? caisseMouvementRepository.findMontantTotalByMouvementId(typeSortie.getId())
                : 0;

        return entree - sortie;
    }

    public boolean estDepensePossible(Double montantDepense) {
        try {
            System.out.println("Montant en caisse:" + getMontantEnCaisse());
            return getMontantEnCaisse() - montantDepense >= 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
