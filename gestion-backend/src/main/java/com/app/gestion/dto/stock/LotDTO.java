package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LotDTO {
    private Integer id;
    private String numero;
    private ArticleDTO article;
    private DepotDTO depot;
    private LocalDateTime dateArrivee;
    private LocalDateTime datePeremption;
    private Double quantite;
    private Double quantiteRestante;
    private Double prixUnitaire;
    private String alerte; // "DLUO", "DLC" or "DLUO,DLC"

    public static LotDTO mapToDTO(com.app.gestion.model.Lot lot) {
        if (lot == null) return null;
        ArticleDTO a = ArticleDTO.mapToDTO(lot.getArticle());
        DepotDTO d = DepotDTO.mapToDTO(lot.getDepot());

        return LotDTO.builder()
                .id(lot.getId())
                .numero(lot.getNumero())
                .article(a)
                .depot(d)
                .dateArrivee(lot.getDateArrivee())
                .datePeremption(lot.getDatePeremption())
                .quantite(lot.getQuantite())
                .quantiteRestante(lot.getQuantiteRestante())
                .prixUnitaire(lot.getPrixUnitaire())
            .alerte(null)
                .build();
    }
}
