package com.app.gestion.repository;

import com.app.gestion.model.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Integer> {
    boolean existsByAchatIdAndFournisseurId(Integer achatId, Integer fournisseurId);
    
    @Query("SELECT c FROM Commande c " +
           "LEFT JOIN FETCH c.achat " +
           "LEFT JOIN FETCH c.fournisseur " +
           "ORDER BY c.dateCommande DESC")
    List<Commande> findAllWithAchatAndFournisseur();

    @Query("SELECT c FROM Commande c " +
           "LEFT JOIN FETCH c.achat " +
           "LEFT JOIN FETCH c.fournisseur " +
           "WHERE c.id = :id")
    Optional<Commande> findByIdWithAchatAndFournisseur(Integer id);

    List<Commande> findByAchatId(Integer achatId);

    List<Commande> findByFournisseurId(Integer fournisseurId);
}
