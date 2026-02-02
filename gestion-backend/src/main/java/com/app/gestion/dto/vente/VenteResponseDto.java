package com.app.gestion.dto.vente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteResponseDto {
    private Integer id;
    private String refe;
    private LocalDateTime dateEntree;
    private LocalDate dateEffective;
    private LocalDate dateLivraison;
    private String locationLivraison;

    // Client
    private Integer clientId;
    private String clientNom;

    // Pro-forma source (si transformation)
    private Integer proformaId;
    private String proformaRefe;

    // Lignes
    private List<VenteLigneDto> lignes;

    // Montants
    private Double montantBrutTotal;
    private Double montantRemiseLignes;
    private Double sousTotal;
    private Double remisePourcentage;
    private Double remiseFixe;
    private Double montantRemiseGlobale;
    private Double montantAvantTVA;
    private Double tauxTVA;
    private Double montantTVA;
    private Double prixTotal;

    // Process
    private Integer processId;
    private Integer processValeur;
    private String processName;
}
