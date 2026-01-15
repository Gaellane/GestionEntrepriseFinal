package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    private Integer id;

    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<Role> roles;
}
