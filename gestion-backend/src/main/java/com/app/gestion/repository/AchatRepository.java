package com.app.gestion.repository;

import com.app.gestion.model.Achat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface AchatRepository extends JpaRepository<Achat, Integer> {
    Optional<Achat> findByRefe(String refe);
    boolean existsByRefe(String refe);

      
    // Pour la liste de tous les achats avec relations
    @Query("SELECT DISTINCT a FROM Achat a " +
           "LEFT JOIN FETCH a.demandeur " +
           "LEFT JOIN FETCH a.process " +
           "LEFT JOIN FETCH a.commandes " +
           "ORDER BY a.dateEntree DESC")
    List<Achat> findAllWithDemandeurAndProcess();
    
    @Query("SELECT a FROM Achat a " +
           "LEFT JOIN FETCH a.demandeur " +
           "LEFT JOIN FETCH a.process " +
           "LEFT JOIN FETCH a.commandes " +
           "WHERE a.id = :id")
    Optional<Achat> findByIdWithDemandeurAndProcess(Integer id);

    // Trouver les achats entre deux dates
    List<Achat> findByDateEntreeBetween(LocalDateTime dateMin, LocalDateTime dateMax);

    // // Version paginée
    // @Query(value = "SELECT DISTINCT a FROM Achat a " +
    //                "LEFT JOIN FETCH a.demandeur " +
    //                "LEFT JOIN FETCH a.process " +
    //                "ORDER BY a.dateEntree DESC",
    //        countQuery = "SELECT COUNT(a) FROM Achat a")
    // Page<Achat> findAllWithDemandeurAndProcess(Pageable pageable);
}
