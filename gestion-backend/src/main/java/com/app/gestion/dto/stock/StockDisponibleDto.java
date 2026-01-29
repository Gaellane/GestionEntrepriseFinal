package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour afficher les informations de stock disponible
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDisponibleDto {
    private Integer articleId;
    private String articleNom;
    private String articleReference;

    private Integer depotId;
    private String depotNom;

    private Double stockTheorique; // Somme des lots.quantite_restante
    private Double stockReserve; // Somme des réservations actives
    private Double stockDisponible; // Théorique - Réservé
}
