package com.app.gestion.repository;

import com.app.gestion.model.Achat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AchatRepository extends JpaRepository<Achat, Integer> {
    Optional<Achat> findByRefe(String refe);
}
