package com.app.gestion.repository;

import com.app.gestion.model.BonCommandeAchat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BonCommandeAchatRepository extends JpaRepository<BonCommandeAchat, Integer> {
    Optional<BonCommandeAchat> findByRefe(String refe);
}
