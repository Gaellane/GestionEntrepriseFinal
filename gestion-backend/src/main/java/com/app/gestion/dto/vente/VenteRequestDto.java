package com.app.gestion.dto.vente;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteRequestDto {

    // Si création depuis pro-forma
    private Integer proformaId;

    // Si création directe
    @NotNull(message = "Le client est obligatoire")
    private Integer clientId;

    @NotEmpty(message = "Au moins une ligne est requise")
    @Valid
    private List<VenteLigneDto> lignes;

    @Min(value = 0, message = "La remise pourcentage doit être positive")
    private Double remisePourcentage;

    @Min(value = 0, message = "La remise fixe doit être positive")
    private Double remiseFixe;

    // Informations de livraison
    @NotNull(message = "La date effective est obligatoire")
    private LocalDate dateEffective;

    private LocalDate dateLivraison;

    private String locationLivraison;
}
