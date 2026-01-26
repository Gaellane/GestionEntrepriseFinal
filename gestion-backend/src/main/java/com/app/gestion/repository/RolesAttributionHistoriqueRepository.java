package com.app.gestion.repository;

import com.app.gestion.model.RolesAttributionHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RolesAttributionHistoriqueRepository extends JpaRepository<RolesAttributionHistorique, Integer> {
    List<RolesAttributionHistorique> findByProcessValeur(Integer valeur);
    List<RolesAttributionHistorique> findByUtilisateurId(Integer utilisateurId);
    List<RolesAttributionHistorique> findByProcessId(Integer processId);
}
