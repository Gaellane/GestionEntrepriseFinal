package com.app.gestion.repository;

import com.app.gestion.model.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {

    @Query("SELECT c FROM Client c WHERE " +
            "LOWER(c.clientNom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(c.contact) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(c.adresse) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Client> searchClients(@Param("searchTerm") String searchTerm, Pageable pageable);

    List<Client> findByClientNomContainingIgnoreCase(String clientNom);

    boolean existsByClientNomIgnoreCase(String clientNom);
}
