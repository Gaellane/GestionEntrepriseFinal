package com.app.gestion.dto.proformavente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProformaVenteLigneDto {

    private Integer id;
    private Integer articleId;
    private String articleNom;
    private String articleReference;
    private Double quantite;
    private Double prixUnitaire;
    private Double remisePourcentage;
    private Double remiseFixe;

    // Champs calculés
    private Double montantBrut; // quantite * prixUnitaire
    private Double montantRemise; // remise appliquée
    private Double montantNet; // après remise ligne
}
