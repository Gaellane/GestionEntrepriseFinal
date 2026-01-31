package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.app.gestion.model.Article;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleDTO {
    private Integer id;
    private String refe;
    private String articleNom;
    private String valorisation;
    private String description;
    
    // Relations
    private Integer categorieId;
    private String categorieName;
    private Integer uniteId;
    private String uniteName;

    public static ArticleDTO mapToDTO(Article art) {
        if (art == null) return null;
        
        ArticleDTO dto = ArticleDTO.builder()
                .id(art.getId())
                .refe(art.getRefe())
                .articleNom(art.getArticleNom())
                .valorisation(art.getValorisation())
                .description(art.getDescription())
                .build();
        
        if (art.getCategorie() != null) {
            dto.setCategorieId(art.getCategorie().getId());
            dto.setCategorieName(art.getCategorie().getCategorieName());
        }
        
        if (art.getUnite() != null) {
            dto.setUniteId(art.getUnite().getId());
            dto.setUniteName(art.getUnite().getUniteName());
        }
        
        return dto;
    }
}
