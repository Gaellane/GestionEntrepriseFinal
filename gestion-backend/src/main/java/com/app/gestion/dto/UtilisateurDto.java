package com.app.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurDto {
    private Integer id;
    private String nom;
    private String email;
    private Integer roleId;
    private String roleName;
}
