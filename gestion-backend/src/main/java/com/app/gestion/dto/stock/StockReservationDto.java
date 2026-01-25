package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour la consultation des réservations de stock
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockReservationDto {
    private Integer id;
    private String reference;
    private LocalDateTime dateReservation;

    // Vente
    private Integer venteId;
    private String venteRefe;

    // Article
    private Integer articleId;
    private String articleNom;
    private String articleReference;

    // Dépôt
    private Integer depotId;
    private String depotNom;

    // Quantité et processus
    private Double quantite;
    private Integer processId;
    private String processName;
    private Integer processValeur;

    // Informations complémentaires
    private String motif;
    private String utilisateurNom;
}
