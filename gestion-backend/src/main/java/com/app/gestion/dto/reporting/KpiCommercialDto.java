package com.app.gestion.dto.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 9.1 - KPI Responsable Commercial
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiCommercialDto {
    // Commandes en cours (Confirmée + En préparation)
    private Long commandesEnCours;

    // Commandes livrées sur la période
    private Long commandesLivrees;

    // Commandes en retard (date_livraison < NOW et process < Livrée)
    private Long commandesEnRetard;

    // Taux d'annulation (%)
    private Double tauxAnnulation;
    private Long commandesAnnulees;
    private Long commandesTotal;

    // Motifs d'annulation (groupés)
    private Map<String, Long> motifsAnnulation;

    // Remises accordées
    private Double totalRemisesFixe;
    private Double totalRemisesPourcentage;
    private Double totalRemises;
    private Double plafondRemise;
    private Boolean depassementPlafond;

    // Exceptions validées
    private Long exceptionsValidees;

    // Backlog non servi (stock insuffisant)
    private Long backlogNonServi;
}
