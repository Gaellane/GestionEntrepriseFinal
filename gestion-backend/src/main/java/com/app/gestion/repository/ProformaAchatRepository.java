package com.app.gestion.repository;

import com.app.gestion.model.ProformaAchat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

@Repository
public interface ProformaAchatRepository extends JpaRepository<ProformaAchat, Integer> {
    Optional<ProformaAchat> findByRefe(String refe);

    @Query("SELECT p FROM ProformaAchat p LEFT JOIN p.proformaAchatLignes WHERE p.achat.id = :achatId AND p.fournisseur.id = :fournisseurId")
    Optional<ProformaAchat> findByAchatIdAndFournisseurId(Integer achatId, Integer fournisseurId);

    @Query("SELECT p FROM ProformaAchat p LEFT JOIN p.proformaAchatLignes WHERE p.achat.id = :achatId ")
    List<ProformaAchat> findByAchatId(Integer achatId);
}
