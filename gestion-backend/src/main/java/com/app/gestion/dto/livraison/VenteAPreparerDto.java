package com.app.gestion.dto.livraison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 4.2 - DTO pour lister les ventes à préparer (Confirmées)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteAPreparerDto {
    private Integer venteId;
    private String venteRefe;
    private String clientNom;
    private String processName;
    private Integer processValeur;
    private Double prixTotal;
    private Integer nombreLignes;
    private String locationLivraison;
    private String dateLivraison;
    private Boolean aLivraisonExistante;
}
