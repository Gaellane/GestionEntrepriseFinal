package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "unites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "unite_name", nullable = false, length = 50)
    private String uniteName;

    @Column(name = "abreviation", nullable = false, length = 10)
    private String abreviation;

    @OneToMany(mappedBy = "unite", fetch = FetchType.LAZY)
    private List<Article> articles;
}
