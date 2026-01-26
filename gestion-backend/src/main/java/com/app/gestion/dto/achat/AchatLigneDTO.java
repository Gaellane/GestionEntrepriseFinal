package com.app.gestion.dto.achat;

import lombok.Data;

@Data
public class AchatLigneDTO {
    private Integer articleId;
    private Double quantite;
    private Double prixUnitaireEstime;
    private Double prixUnitaire;

    public static AchatLigneDTO mapToDTO(com.app.gestion.model.AchatLigne ligne) {
        AchatLigneDTO dto = new AchatLigneDTO();
        dto.setArticleId(ligne.getArticle().getId());
        dto.setQuantite(ligne.getQuantite());
        dto.setPrixUnitaireEstime(ligne.getPrixUnitaireEstime());
        dto.setPrixUnitaire(ligne.getPrixUnitaire());
        return dto;
    }

    public String toString() {
        return "AchatLigneDTO{" +
                "articleId=" + articleId +
                ", quantite=" + quantite +
                ", prixUnitaireEstime=" + prixUnitaireEstime +
                '}';
    }
}