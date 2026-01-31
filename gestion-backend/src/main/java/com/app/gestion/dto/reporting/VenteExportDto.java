package com.app.gestion.dto.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 9.5 - DTO pour export des ventes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteExportDto {
    private Integer id;
    private String reference;
    private String clientNom;
    private LocalDateTime dateEntree;
    private LocalDate dateEffective;
    private LocalDate dateLivraison;
    private String locationLivraison;
    private Double prixTotal;
    private Double remisePourcentage;
    private Double remiseFixe;
    private Double remiseTotale;
    private String statut;
    private Integer statutValeur;

    // Pour export détaillé avec lignes
    private List<VenteLigneExportDto> lignes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VenteLigneExportDto {
        private Integer articleId;
        private String articleReference;
        private String articleNom;
        private Double quantite;
        private Double prixUnitaire;
        private Double remisePourcentage;
        private Double remiseFixe;
        private Double montantLigne;
    }
}
