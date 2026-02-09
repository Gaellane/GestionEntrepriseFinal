package com.app.gestion.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tendance d'achat pour un client donné.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientTrendDto {
    private Integer clientId;
    private String clientNom;
    private double totalAchatsAnneeCourante;
    private double totalAchatsAnneePrecedente;
    private double evolutionPourcent;           // (courant - precedent) / precedent * 100
    private int nombreCommandesAnneeCourante;
    private int nombreCommandesAnneePrecedente;
    private double panierMoyen;
    private String tendance;                    // HAUSSE, BAISSE, STABLE, NOUVEAU
}
