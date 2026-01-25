package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepotDTO {
    private Integer id;
    private String depotName;

    public static DepotDTO mapToDTO(com.app.gestion.model.Depot dep) {
        if (dep == null) return null;
        return DepotDTO.builder()
                .id(dep.getId())
                .depotName(dep.getDepotName())
                .build();
    }
}
