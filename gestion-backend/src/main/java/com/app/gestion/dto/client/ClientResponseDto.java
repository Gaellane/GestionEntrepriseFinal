package com.app.gestion.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientResponseDto {

    private Integer id;
    private String clientNom;
    private String contact;
    private String adresse;
    private String coordonneeBancaire;
}
