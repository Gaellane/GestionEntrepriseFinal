package com.app.gestion.repository;

import com.app.gestion.model.Vente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VenteRepository extends JpaRepository<Vente, Integer> {
    Optional<Vente> findByRefe(String refe);

    // =========== KPI COMMERCIAL (9.1) ===========

    // Commandes en cours (Confirmée=60, En préparation=70)
    @Query("SELECT COUNT(v) FROM Vente v WHERE v.process.valeur IN (60, 70) " +
            "AND v.dateEntree BETWEEN :dateDebut AND :dateFin")
    Long countCommandesEnCours(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Commandes livrées (process=90)
    @Query("SELECT COUNT(v) FROM Vente v WHERE v.process.valeur = 90 " +
            "AND v.dateEntree BETWEEN :dateDebut AND :dateFin")
    Long countCommandesLivrees(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Commandes en retard (date_livraison < today et process < 90)
    @Query("SELECT COUNT(v) FROM Vente v WHERE v.dateLivraison < :today " +
            "AND v.process.valeur < 90 AND v.process.valeur >= 60")
    Long countCommandesEnRetard(@Param("today") LocalDate today);

    // Commandes annulées (process=99)
    @Query("SELECT COUNT(v) FROM Vente v WHERE v.process.valeur = 99 " +
            "AND v.dateEntree BETWEEN :dateDebut AND :dateFin")
    Long countCommandesAnnulees(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Total commandes sur période
    @Query("SELECT COUNT(v) FROM Vente v WHERE v.dateEntree BETWEEN :dateDebut AND :dateFin")
    Long countCommandesTotalPeriode(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Somme remises fixes
    @Query("SELECT COALESCE(SUM(v.remiseFixe), 0.0) FROM Vente v " +
            "WHERE v.dateEntree BETWEEN :dateDebut AND :dateFin")
    Double sumRemisesFixe(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Somme équivalent remises pourcentage
    @Query("SELECT COALESCE(SUM(v.prixTotal * v.remisePourcentage / 100), 0.0) FROM Vente v " +
            "WHERE v.dateEntree BETWEEN :dateDebut AND :dateFin")
    Double sumRemisesPourcentage(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // =========== KPI FINANCE (9.2) ===========

    // CA réalisé (ventes livrées)
    @Query("SELECT COALESCE(SUM(v.prixTotal), 0.0) FROM Vente v " +
            "WHERE v.process.valeur = 90 " +
            "AND v.dateEntree BETWEEN :dateDebut AND :dateFin")
    Double sumCaRealise(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // =========== KPI DIRECTION (9.3) ===========

    // CA global (toutes ventes confirmées et plus)
    @Query("SELECT COALESCE(SUM(v.prixTotal), 0.0) FROM Vente v " +
            "WHERE v.process.valeur >= 60 AND v.process.valeur < 99 " +
            "AND v.dateEntree BETWEEN :dateDebut AND :dateFin")
    Double sumCaGlobal(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Top clients (via proforma -> client)
    @Query("SELECT v.proforma.client.id, v.proforma.client.clientNom, " +
            "SUM(v.prixTotal), COUNT(v) " +
            "FROM Vente v " +
            "WHERE v.process.valeur >= 60 AND v.process.valeur < 99 " +
            "AND v.dateEntree BETWEEN :dateDebut AND :dateFin " +
            "GROUP BY v.proforma.client.id, v.proforma.client.clientNom " +
            "ORDER BY SUM(v.prixTotal) DESC")
    List<Object[]> findTopClientsByCa(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Top articles vendus
    @Query("SELECT vl.article.id, vl.article.refe, vl.article.articleNom, " +
            "SUM(vl.quantite), SUM(vl.quantite * vl.prixUnitaire) " +
            "FROM VenteLigne vl " +
            "WHERE vl.vente.process.valeur >= 60 AND vl.vente.process.valeur < 99 " +
            "AND vl.vente.dateEntree BETWEEN :dateDebut AND :dateFin " +
            "GROUP BY vl.article.id, vl.article.refe, vl.article.articleNom " +
            "ORDER BY SUM(vl.quantite) DESC")
    List<Object[]> findTopArticlesByQuantite(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // =========== DASHBOARD (9.4) ===========

    // Commandes par statut pour pipeline
    @Query("SELECT v.process.processName, COUNT(v) FROM Vente v " +
            "WHERE v.dateEntree BETWEEN :dateDebut AND :dateFin " +
            "GROUP BY v.process.processName, v.process.valeur " +
            "ORDER BY v.process.valeur")
    List<Object[]> countByStatut(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // CA par mois (12 derniers mois)
    @Query(value = "SELECT TO_CHAR(v.date_entree, 'YYYY-MM') as mois, " +
            "COALESCE(SUM(v.prix_total), 0) as ca " +
            "FROM ventes v " +
            "JOIN vente_processes vp ON v.process_id = vp.id " +
            "WHERE vp.valeur >= 60 AND vp.valeur < 99 " +
            "AND v.date_entree >= :dateDebut " +
            "GROUP BY TO_CHAR(v.date_entree, 'YYYY-MM') " +
            "ORDER BY mois", nativeQuery = true)
    List<Object[]> findCaMensuel(@Param("dateDebut") LocalDateTime dateDebut);

    // Ventes en retard (pour alertes)
    @Query("SELECT v FROM Vente v WHERE v.dateLivraison < :today " +
            "AND v.process.valeur >= 60 AND v.process.valeur < 90")
    List<Vente> findVentesEnRetard(@Param("today") LocalDate today);

    // =========== FILTRES AVANCÉS (9.5) ===========

    // Ventes avec filtres multiples
    @Query("SELECT v FROM Vente v " +
            "WHERE v.dateEntree BETWEEN :dateDebut AND :dateFin " +
            "AND (:commercialId IS NULL OR v.proforma.utilisateur.id = :commercialId) " +
            "AND (:clientId IS NULL OR v.proforma.client.id = :clientId) " +
            "ORDER BY v.dateEntree DESC")
    List<Vente> findWithFilters(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin,
            @Param("commercialId") Integer commercialId,
            @Param("clientId") Integer clientId);
}
