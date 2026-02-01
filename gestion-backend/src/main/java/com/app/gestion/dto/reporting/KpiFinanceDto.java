package com.app.gestion.dto.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 9.2 - KPI Finance (Ventes)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiFinanceDto {
    // CA réalisé (ventes livrées)
    private Double caRealise;

    // CA facturé (= CA réalisé car pas de table factures)
    private Double caFacture;

    // CA encaissé (caisse_mouvements type Encaissement)
    private Double caEncaisse;

    // Volume remboursements
    private Double volumeRemboursements;

    // Causes remboursements (groupées)
    private Map<String, Double> causesRemboursements;

    // Marge
    private Double prixVenteTotal;
    private Double coutReelTotal;
    private Double margeBrute;
    private Double margePercent;

    // Variation marge vs période précédente
    private Double margePeriodePrecedente;
    private Double variationMarge;
    private Double variationMargePercent;
}
