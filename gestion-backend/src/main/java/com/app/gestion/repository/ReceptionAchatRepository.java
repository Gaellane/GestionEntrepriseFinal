package com.app.gestion.repository;

import com.app.gestion.model.ReceptionAchat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReceptionAchatRepository extends JpaRepository<ReceptionAchat, Integer> {
    Optional<ReceptionAchat> findByRefe(String refe);
}
