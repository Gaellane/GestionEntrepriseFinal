package com.app.gestion.repository;

import com.app.gestion.model.ProformaAchat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProformaAchatRepository extends JpaRepository<ProformaAchat, Integer> {
    Optional<ProformaAchat> findByRefe(String refe);
}
