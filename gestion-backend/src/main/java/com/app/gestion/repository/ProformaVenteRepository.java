package com.app.gestion.repository;

import com.app.gestion.model.ProformaVente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProformaVenteRepository extends JpaRepository<ProformaVente, Integer> {
    Optional<ProformaVente> findByRefe(String refe);
}
