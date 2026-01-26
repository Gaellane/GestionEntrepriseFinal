package com.app.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolesAttributionHistoriqueDto {
    private Integer id;
    private Integer utilisateurId;
    private String utilisateurEmail;
    private String utilisateurNom;
    private Integer roleId;
    private String roleCode;
    private String roleName;
    private Integer processId;
    private String processName;
    private String processAbreviation;
    private LocalDateTime dateEntree;
}
