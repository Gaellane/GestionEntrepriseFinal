package com.app.gestion.dto.configuration;

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
public class ConfigurationRequestDto {

    @NotBlank(message = "La clé de configuration est obligatoire")
    @Size(max = 100, message = "La clé ne doit pas dépasser 100 caractères")
    private String configKey;

    @NotBlank(message = "La valeur de configuration est obligatoire")
    private String configValue;

    private String description;
}
