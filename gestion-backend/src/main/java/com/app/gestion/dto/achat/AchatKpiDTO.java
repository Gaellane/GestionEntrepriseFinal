package com.app.gestion.dto.achat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchatKpiDTO {
    private Double montantTotalAchats;
    private Double montantTotalCommandes;
    private Double prixEstimationTotal;
    private Double prixReelTotal;
    private Double ecartPrix;
    private Double pourcentageEcart;
    private Double coutMoyenParAchat;
    private Integer nombreAchats;
}
