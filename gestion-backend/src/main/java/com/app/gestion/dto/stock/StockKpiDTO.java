package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockKpiDTO {
    private Double tauxPrecision;
    private Double stockTheoriqueTotal;
    private Double stockPhysiqueTotal;
    private List<ArticleStockComparison> details;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ArticleStockComparison {
        private Integer articleId;
        private String articleNom;
        private String articleRef;
        private Integer categoryId;
        private String categoryName;
        private Double stockTheorique;
        private Double stockPhysique;
        private Double ecart;
        private Double tauxPrecision;
        private String valorisation;
        private Double valeurStock;
    }
}
