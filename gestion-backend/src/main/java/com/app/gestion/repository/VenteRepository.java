package com.app.gestion.repository;

import com.app.gestion.model.Vente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VenteRepository extends JpaRepository<Vente, Integer> {
    Optional<Vente> findByRefe(String refe);
}
