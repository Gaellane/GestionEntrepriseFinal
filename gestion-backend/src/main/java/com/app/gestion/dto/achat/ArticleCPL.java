package com.app.gestion.dto.achat;

import lombok.*;

import com.app.gestion.model.Article;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleCPL{
    private Integer id;
    private String refe;
    private String articleNom;
    private String valorisation;
    private String description;
    private UniteDTO unite;
    private CategorieDTO categorie;
    
    public static ArticleCPL mapToDTO(Article article) {
        if (article == null) return null;
        return new ArticleCPL(
                article.getId(),
                article.getRefe(),
                article.getArticleNom(),
                article.getValorisation(),
                article.getDescription(),
                UniteDTO.mapToDTO(article.getUnite()),
                CategorieDTO.mapToDTO(article.getCategorie())
        );
    }

}
