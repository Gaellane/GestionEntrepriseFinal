package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BonCommandeAchatLigneDTO {
    private ArticleCPL article;
    private Integer articleId;
    private Double quantite;
    private Double prixUnitaire;

    public static BonCommandeAchatLigneDTO mapToDTO(com.app.gestion.model.BonCommandeAchatLigne entity) {
        BonCommandeAchatLigneDTO dto = new BonCommandeAchatLigneDTO();
        dto.setArticleId(entity.getArticle().getId());
        dto.setArticle(ArticleCPL.mapToDTO(entity.getArticle()));
        dto.setQuantite(entity.getQuantite());
        dto.setPrixUnitaire(entity.getPrixUnitaire());
        return dto;
    }

}