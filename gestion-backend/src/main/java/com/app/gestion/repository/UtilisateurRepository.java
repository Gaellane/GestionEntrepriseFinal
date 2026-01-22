package com.app.gestion.repository;

import com.app.gestion.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    Optional<Utilisateur> findByNom(String nom);
    Optional<Utilisateur> findByEmail(String email);
    Optional<Utilisateur> findByEmailAndMotDePasse(String email,String motDePasse);
}
