package com.app.gestion.dto.stock;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementResponse {
    private ArticleDTO article;
    private List<DepotDTO> depots;
}
