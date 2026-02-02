package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepotDTO {
    private Integer id;
    private String depotName;

    public static DepotDTO mapToDTO(com.app.gestion.model.Depot depot) {
        if (depot == null) return null;
        return DepotDTO.builder()
                .id(depot.getId())
                .depotName(depot.getDepotName())
                .build();
    }
}
