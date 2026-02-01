package com.app.gestion.dto.livraison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LivraisonVenteLigneDto {
    private Integer id;
    private Integer articleId;
    private String articleNom;
    private String articleReference;
    private Double quantite;
    private Double quantiteVente; // Quantité dans la vente d'origine
}
