package com.app.gestion.dto.livraison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 4.3 - DTO pour afficher les lots disponibles pour le picking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LotDisponibleDto {
    private Integer lotId;
    private Integer articleId;
    private String articleNom;
    private Integer depotId;
    private String depotNom;
    private Double quantiteRestante;
    private LocalDateTime dateArrivee;
    private LocalDateTime datePeremption;
    private Double prixUnitaire;
    private Boolean estPerissable;
    private Boolean estExpire;
    private Integer joursAvantExpiration;
}
