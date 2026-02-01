package com.app.gestion.dto.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 9.4 - Dashboard complet
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    // Type de dashboard
    private String typeDashboard; // COMMERCIAL, RESPONSABLE, DIRECTION

    // KPIs résumés
    private Long commandesDuJour;
    private Double caSemaine;
    private Double caMois;

    // Pipeline (Brouillon → Livrée)
    private Map<String, Long> pipeline;

    // Taux conversion proforma → commande
    private Double tauxConversion;
    private Long proformasTotal;
    private Long proformasConvertis;

    // Alertes
    private List<AlerteDto> alertes;

    // Graphique CA par mois (12 derniers mois)
    private List<CaMensuelDto> caMensuel;

    // Graphique marge par famille
    private List<MargeParFamilleDto> margeParFamille;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlerteDto {
        private String type; // REMISE_EXCEPTIONNELLE, RETARD_LIVRAISON, STOCK_INSUFFISANT
        private String message;
        private String priorite; // HIGH, MEDIUM, LOW
        private Integer referenceId;
        private String referenceType; // VENTE, PROFORMA
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaMensuelDto {
        private String mois; // YYYY-MM
        private Double ca;
        private Double marge;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MargeParFamilleDto {
        private Integer categorieId;
        private String categorieNom;
        private Double ca;
        private Double marge;
        private Double margePercent;
    }
}
