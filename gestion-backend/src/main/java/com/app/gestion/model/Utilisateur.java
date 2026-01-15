package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "mot_de_passe", nullable = false, length = 100)
    private String motDePasse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id", nullable = false)
    private Entity entity;

    @OneToMany(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    private List<AuditLog> auditLogs;

    @OneToMany(mappedBy = "demandeur", fetch = FetchType.LAZY)
    private List<Achat> achats;

    @OneToMany(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    private List<Inventaire> inventaires;
}
