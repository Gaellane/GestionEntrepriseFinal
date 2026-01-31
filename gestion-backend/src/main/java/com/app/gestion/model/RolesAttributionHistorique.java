package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "roles_attribution_historiques")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolesAttributionHistorique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    @lombok.ToString.Exclude
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    @lombok.ToString.Exclude
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    @lombok.ToString.Exclude
    private RolesAttributionProcess process;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;
}
