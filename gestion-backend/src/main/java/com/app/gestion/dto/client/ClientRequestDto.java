package com.app.gestion.dto.client;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientRequestDto {

    @NotBlank(message = "Le nom du client est obligatoire")
    @Size(max = 100, message = "Le nom du client ne doit pas dépasser 100 caractères")
    private String clientNom;

    @Size(max = 100, message = "Le contact ne doit pas dépasser 100 caractères")
    private String contact;

    private String adresse;

    private String coordonneeBancaire;
}
