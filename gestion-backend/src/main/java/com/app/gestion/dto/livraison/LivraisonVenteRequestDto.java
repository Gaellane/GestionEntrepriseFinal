package com.app.gestion.dto.livraison;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LivraisonVenteRequestDto {
    
    @NotNull(message = "L'ID de la vente est obligatoire")
    private Integer venteId;
    
    // Pour livraison partielle: permet de modifier les quantités
    private List<LivraisonVenteLigneDto> lignes;
}
