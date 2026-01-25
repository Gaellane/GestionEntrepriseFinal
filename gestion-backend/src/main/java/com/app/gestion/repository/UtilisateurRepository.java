package com.app.gestion.repository;

import com.app.gestion.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    Optional<Utilisateur> findByNom(String nom);
    
    Optional<Utilisateur> findByEmail(String email);
    
    // Requête avec FETCH JOIN pour charger le rôle et éviter LazyInitializationException
    @Query("SELECT u FROM Utilisateur u JOIN FETCH u.role WHERE u.email = :email")
    Optional<Utilisateur> findByEmailWithRole(@Param("email") String email);
    
    Optional<Utilisateur> findByEmailAndMotDePasse(String email,String motDePasse);
}
