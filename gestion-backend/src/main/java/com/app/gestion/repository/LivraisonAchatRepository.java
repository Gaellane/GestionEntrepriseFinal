package com.app.gestion.repository;

import com.app.gestion.model.LivraisonAchat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LivraisonAchatRepository extends JpaRepository<LivraisonAchat, Integer> {
    Optional<LivraisonAchat> findByRefe(String refe);
}
