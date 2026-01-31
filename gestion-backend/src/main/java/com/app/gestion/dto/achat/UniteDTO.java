package com.app.gestion.dto.achat;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniteDTO {
    private Integer id; 
    private String uniteName;
    private String abreviation;

    public static UniteDTO mapToDTO(com.app.gestion.model.Unite unite) {
        if (unite == null) return null;
        return UniteDTO.builder()
                .id(unite.getId())
                .uniteName(unite.getUniteName())
                .abreviation(unite.getAbreviation())
                .build();
    }
}
