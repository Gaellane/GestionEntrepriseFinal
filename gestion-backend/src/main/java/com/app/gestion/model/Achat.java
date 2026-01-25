package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "achats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demandeur", nullable = false)
    @lombok.ToString.Exclude
    private Utilisateur demandeur;

    @Column(name = "date_effective", nullable = false)
    private LocalDate dateEffective;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    @lombok.ToString.Exclude
    private AchatProcess process;

    @Column(name = "refe", unique = true, nullable = false, length = 100)
    private String refe;

    @OneToMany(mappedBy = "achat", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<AchatLigne> achatLignes;

    @OneToMany(mappedBy = "achat", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<AchatHistorique> achatHistoriques;

    @OneToMany(mappedBy = "achat", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<ProformaAchat> proformaAchats;
}
