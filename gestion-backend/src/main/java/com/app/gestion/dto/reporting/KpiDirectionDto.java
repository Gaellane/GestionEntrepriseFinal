package com.app.gestion.dto.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 9.3 - KPI Direction Générale (Ventes)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiDirectionDto {
    // CA global
    private Double caGlobal;

    // Marge brute
    private Double margeBrute;

    // Marge %
    private Double margePercent;

    // Évolution vs période précédente
    private Double caPeriodePrecedente;
    private Double evolutionCa;
    private Double evolutionCaPercent;

    // Top 10 clients
    private List<TopClientDto> topClients;

    // Top 10 articles vendus
    private List<TopArticleDto> topArticles;

    // Top commerciaux
    private List<TopCommercialDto> topCommerciaux;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopClientDto {
        private Integer clientId;
        private String clientNom;
        private Double totalAchats;
        private Long nombreCommandes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopArticleDto {
        private Integer articleId;
        private String articleNom;
        private String articleReference;
        private Double quantiteTotale;
        private Double caTotalArticle;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopCommercialDto {
        private Integer utilisateurId;
        private String utilisateurNom;
        private Double caTotal;
        private Long nombreCommandes;
        private Double tauxAnnulation;
    }
}
