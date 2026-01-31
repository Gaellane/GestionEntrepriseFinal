package com.app.gestion.dto.configuration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfigurationResponseDto {

    private Integer id;
    private String configKey;
    private String configValue;
    private String description;
}
