package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "stock_type_mouvements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTypeMouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type_name", nullable = false, length = 100)
    private String typeName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "typeMouvement", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<LotMouvement> lotMouvements;
}
