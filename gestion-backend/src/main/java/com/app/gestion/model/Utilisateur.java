package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

import com.app.gestion.dto.UtilisateurDto;

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

    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "mot_de_passe", nullable = false, length = 100)
    private String motDePasse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    @lombok.ToString.Exclude
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id", nullable = false)
    @lombok.ToString.Exclude
    private Entity entity;

    @OneToMany(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<AuditLog> auditLogs;

    @OneToMany(mappedBy = "demandeur", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<Achat> achats;

    @OneToMany(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<Inventaire> inventaires;


    public UtilisateurDto convertToDto()
    {
        UtilisateurDto u = new UtilisateurDto();
        u.setId(id);
        u.setEmail(email);
        u.setNom(nom);
        u.setRoleId(role.getId());
        u.setRoleName(role.getRoleName());

        return u;
    }
}
