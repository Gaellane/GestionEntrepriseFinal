package com.app.gestion.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String nom;
    private String email;
    private String motDePasse;
    private Integer roleId;
    private Integer entityId;
}