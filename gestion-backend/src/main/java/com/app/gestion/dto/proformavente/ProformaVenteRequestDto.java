package com.app.gestion.dto.proformavente;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProformaVenteRequestDto {

    @NotNull(message = "Le client est obligatoire")
    private Integer clientId;

    @NotEmpty(message = "Au moins une ligne d'article est requise")
    @Valid
    private List<ProformaVenteLigneDto> lignes;

    @Min(value = 0, message = "La remise en pourcentage doit être positive")
    private Double remisePourcentage;

    @Min(value = 0, message = "La remise fixe doit être positive")
    private Double remiseFixe;
}
