package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaisonMouvementDTO {
    private Integer id;
    private String raisonName;
    private String description;
}