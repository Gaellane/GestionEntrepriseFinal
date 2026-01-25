package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleRemainingDTO {
    private Integer articleId;
    private String articleNom;
    private String articleRef;
    private Integer categoryId;
    private String categoryName;
    private Double quantiteRestante;
}
