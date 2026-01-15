package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "caisse_type_mouvements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaisseTypeMouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type_name", nullable = false, length = 100)
    private String typeName;

    @Column(name = "valeur", nullable = false)
    private Integer valeur;

    @OneToMany(mappedBy = "typeMouvement", fetch = FetchType.LAZY)
    private List<CaisseMouvement> caisseMouvements;
}
