package com.app.gestion.dto.proformavente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProformaVenteResponseDto {

    private Integer id;
    private String refe;
    private LocalDateTime dateEntree;

    // Client
    private Integer clientId;
    private String clientNom;

    // Lignes
    private List<ProformaVenteLigneDto> lignes;

    // Montants
    private Double montantBrutTotal; // Somme des montants bruts des lignes
    private Double montantRemiseLignes; // Somme des remises appliquées aux lignes
    private Double sousTotal; // Après remises lignes
    private Double remisePourcentage; // Remise globale en %
    private Double remiseFixe; // Remise globale fixe
    private Double montantRemiseGlobale; // Remise globale calculée
    private Double montantAvantTVA; // Après toutes les remises
    private Double tauxTVA; // Taux de TVA appliqué
    private Double montantTVA; // Montant de la TVA
    private Double prixTotal; // Total TTC

    // Process
    private Integer processId;
    private String processName;
}
