package com.app.gestion.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.stereotype.Service;

import com.app.gestion.dto.achat.AchatKpiDTO;
import com.app.gestion.model.Achat;
import com.app.gestion.model.BonCommandeAchat;
import com.app.gestion.repository.AchatRepository;
import com.app.gestion.repository.BonCommandeAchatRepository;

@Service
public class AchatKpiService {

    private final AchatRepository achatRepository;
    private final BonCommandeAchatRepository bonCommandeAchatRepository;

    public AchatKpiService(AchatRepository achatRepository, BonCommandeAchatRepository bonCommandeAchatRepository) {
        this.achatRepository = achatRepository;
        this.bonCommandeAchatRepository = bonCommandeAchatRepository;
    }

    /**
     * Calcule le montant total des achats entre deux dates
     */
    public Double getMontantTotalAchats(LocalDateTime dateMin, LocalDateTime dateMax) {
        List<Achat> achats = achatRepository.findByDateEntreeBetween(dateMin, dateMax);
        return achats.stream()
                .mapToDouble(a -> a.getAchatLignes().stream()
                        .mapToDouble(ligne -> ligne.getQuantite() * ligne.getPrixUnitaireEstime())
                        .sum())
                .sum();
    }

    /**
     * Calcule le montant total à sortir dans les commandes entre deux dates
     */
    public Double getMontantTotalCommandes(LocalDateTime dateMin, LocalDateTime dateMax) {
        List<BonCommandeAchat> commandes = bonCommandeAchatRepository.findByDateEntreeBetween(dateMin, dateMax);
        return commandes.stream()
                .mapToDouble(BonCommandeAchat::getMontantTotal)
                .sum();
    }

    /**
     * Compare le prix réel (bon de commande) et l'estimation (achat) entre deux dates
     */
    public AchatKpiDTO getComparaisonPrixEstimationVsReel(LocalDateTime dateMin, LocalDateTime dateMax) {
        List<Achat> achats = achatRepository.findByDateEntreeBetween(dateMin, dateMax);
        
        double prixEstimationTotal = 0.0;
        AtomicReference<Double> prixReelTotal = new AtomicReference<>(0.0);
        
        for (Achat achat : achats) {
            // Prix d'estimation
            double estimation = achat.getAchatLignes().stream()
                    .mapToDouble(ligne -> ligne.getQuantite() * ligne.getPrixUnitaireEstime())
                    .sum();
            prixEstimationTotal += estimation;
            
            // Prix réel du bon de commande
            bonCommandeAchatRepository.findByProforma_Achat_Id(achat.getId())
                    .ifPresent(bonCommande -> prixReelTotal.updateAndGet(v -> v + bonCommande.getMontantTotal()));
        }
        
        double ecart = prixReelTotal.get() - prixEstimationTotal;
        double pourcentageEcart = prixEstimationTotal > 0 ? (ecart / prixEstimationTotal) * 100 : 0;
        
        return AchatKpiDTO.builder()
                .prixEstimationTotal(prixEstimationTotal)
                .prixReelTotal(prixReelTotal.get())
                .ecartPrix(ecart)
                .pourcentageEcart(pourcentageEcart)
                .build();
    }

    /**
     * Calcule le coût moyen par achat entre deux dates
     */
    public Double getCoutMoyenParAchat(LocalDateTime dateMin, LocalDateTime dateMax) {
        List<Achat> achats = achatRepository.findByDateEntreeBetween(dateMin, dateMax);
        
        if (achats.isEmpty()) {
            return 0.0;
        }
        
        double total = achats.stream()
                .mapToDouble(a -> a.getAchatLignes().stream()
                        .mapToDouble(ligne -> ligne.getQuantite() * ligne.getPrixUnitaireEstime())
                        .sum())
                .sum();
        
        return total / achats.size();
    }

    /**
     * Récupère tous les KPIs en une seule fois
     */
    public AchatKpiDTO getAllKpis(LocalDateTime dateMin, LocalDateTime dateMax) {
        List<Achat> achats = achatRepository.findByDateEntreeBetween(dateMin, dateMax);
        
        double montantTotalAchats = 0.0;
        double prixEstimationTotal = 0.0;
        AtomicReference<Double> prixReelTotal = new AtomicReference<>(0.0);
        
        for (Achat achat : achats) {
            double estimation = achat.getAchatLignes().stream()
                    .mapToDouble(ligne -> ligne.getQuantite() * ligne.getPrixUnitaireEstime())
                    .sum();
            montantTotalAchats += estimation;
            prixEstimationTotal += estimation;
            
            bonCommandeAchatRepository.findByProforma_Achat_Id(achat.getId())
                    .ifPresent(bonCommande -> prixReelTotal.updateAndGet(v -> v + bonCommande.getMontantTotal()));
        }
        
        List<BonCommandeAchat> commandes = bonCommandeAchatRepository.findByDateEntreeBetween(dateMin, dateMax);
        double montantTotalCommandes = commandes.stream()
                .mapToDouble(BonCommandeAchat::getMontantTotal)
                .sum();
        
        double ecart = prixReelTotal.get() - prixEstimationTotal;
        double pourcentageEcart = prixEstimationTotal > 0 ? (ecart / prixEstimationTotal) * 100 : 0;
        double coutMoyen = achats.isEmpty() ? 0.0 : montantTotalAchats / achats.size();
        
        return AchatKpiDTO.builder()
                .montantTotalAchats(montantTotalAchats)
                .montantTotalCommandes(montantTotalCommandes)
                .prixEstimationTotal(prixEstimationTotal)
                .prixReelTotal(prixReelTotal.get())
                .ecartPrix(ecart)
                .pourcentageEcart(pourcentageEcart)
                .coutMoyenParAchat(coutMoyen)
                .nombreAchats(achats.size())
                .build();
    }
}
