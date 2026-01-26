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

    public static ArticleDTO mapToDTO(Article art) {
        if (art == null) return null;
        return new ArticleDTO(
                art.getId(),
                art.getRefe(),
                art.getArticleNom(),
                art.getValorisation(),
                art.getDescription()
        );
    }
}
