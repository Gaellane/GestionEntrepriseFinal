package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionAchatLigneDTO {
    private Integer id;
    private ArticleCPL article;
    private Integer articleId;
    private DepotDTO depot;
    private Integer depotId;
    private Double quantite;

    public static ReceptionAchatLigneDTO mapToDTO(com.app.gestion.model.ReceptionAchatLigne entity) {
        ReceptionAchatLigneDTO dto = new ReceptionAchatLigneDTO();
        dto.setId(entity.getId());
        dto.setArticleId(entity.getArticle().getId());
        dto.setArticle(ArticleCPL.mapToDTO(entity.getArticle()));
        dto.setDepotId(entity.getDepot().getId());
        dto.setDepot(DepotDTO.mapToDTO(entity.getDepot()));
        dto.setQuantite(entity.getQuantite());
        return dto;
    }
}
