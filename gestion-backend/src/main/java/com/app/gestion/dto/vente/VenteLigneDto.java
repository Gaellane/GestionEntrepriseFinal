package com.app.gestion.dto.vente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteLigneDto {
    private Integer id;
    private Integer articleId;
    private String articleNom;
    private String articleReference;
    private Double quantite;
    private Double prixUnitaire;
    private Double remisePourcentage;
    private Double remiseFixe;

    // Montants calculés
    private Double montantBrut;
    private Double montantRemise;
    private Double montantNet;
}
