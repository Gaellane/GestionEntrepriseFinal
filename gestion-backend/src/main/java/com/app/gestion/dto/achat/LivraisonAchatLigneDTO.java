package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LivraisonAchatLigneDTO {
    private Integer id;
    private ArticleCPL article;
    private Integer articleId;
    private Double quantite;

    public static LivraisonAchatLigneDTO mapToDTO(com.app.gestion.model.LivraisonAchatLigne entity) {
        LivraisonAchatLigneDTO dto = new LivraisonAchatLigneDTO();
        dto.setId(entity.getId());
        dto.setArticleId(entity.getArticle().getId());
        dto.setArticle(ArticleCPL.mapToDTO(entity.getArticle()));
        dto.setQuantite(entity.getQuantite());
        return dto;
    }
}
