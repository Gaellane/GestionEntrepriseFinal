package com.app.gestion.dto.livraison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LivraisonVenteResponseDto {
    private Integer id;
    private String refe;
    private Integer venteId;
    private String venteRefe;
    private String clientNom;
    private String processName;
    private Integer processValeur;
    private LocalDateTime dateEntree;
    private List<LivraisonVenteLigneDto> lignes;
}
