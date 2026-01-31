package com.app.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolesAttributionProcessDto {
    private Integer id;
    private String processName;
    private String abreviation;
    private Integer valeur;
}
