package com.app.gestion.dto.stock;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementRequest {
    // "ENTREE" or "SORTIE"
    private String type;

    private Integer articleId;
    private Integer depotId; // required for ENTREE
    private Double quantite;
    private Integer raisonId;
    private String description;
    private LocalDateTime date;
    private LocalDateTime datePeremption; // optional for entree
}
