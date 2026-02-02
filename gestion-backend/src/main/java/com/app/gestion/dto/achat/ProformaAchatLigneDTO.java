package com.app.gestion.dto.achat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProformaAchatLigneDTO{
    private ArticleCPL article;
    private Double quantite;
    private Double prixUnitaire;
    private Double montantTotal;

    public static ProformaAchatLigneDTO mapToDTO(com.app.gestion.model.ProformaAchatLigne proformaAchatLigne) {
        if (proformaAchatLigne == null) {
            return null;
        }
        ProformaAchatLigneDTO dto = new ProformaAchatLigneDTO();
        dto.setArticle(ArticleCPL.mapToDTO(proformaAchatLigne.getArticle()));
        dto.setQuantite(proformaAchatLigne.getQuantite());
        dto.setPrixUnitaire(proformaAchatLigne.getPrixUnitaire());
        dto.setMontantTotal(proformaAchatLigne.getQuantite() * proformaAchatLigne.getPrixUnitaire());
        return dto;
    }
}