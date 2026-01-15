package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Configuration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "config_key", nullable = false, unique = true, length = 100)
    private String configKey;

    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String configValue;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
