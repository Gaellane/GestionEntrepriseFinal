package com.app.gestion.dto.achat;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProformaAchatLigneCreateDTO {
    private Integer articleId;
    private Double quantite;
    private Double prixUnitaire;

    public String toString(){
        return "ArticleID:"+articleId+";Quantite:"+quantite+";PrixUnitaire:"+prixUnitaire;
    }
}
