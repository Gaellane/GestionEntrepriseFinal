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
public class InventaireLigneRequest {
    private Integer inventaireId;
    private List<Ligne> lignes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Ligne {
        private Integer articleId;
        private Double quantite;
    }
}
