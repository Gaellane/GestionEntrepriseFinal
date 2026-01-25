package com.app.gestion.service;

import com.app.gestion.model.*;
import com.app.gestion.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour le service de réservation de stock
 */
@ExtendWith(MockitoExtension.class)
class StockReservationServiceTest {

    @Mock
    private StockReservationRepository stockReservationRepository;

    @Mock
    private LotRepository lotRepository;

    @InjectMocks
    private StockReservationService stockReservationService;

    private final Integer articleId = 1;
    private final Integer depotId = 1;

    @BeforeEach
    void setUp() {
        // Configuration commune pour les tests
    }

    @Test
    void testCalculerStockTheorique_AvecLots() {
        // Given
        Double stockAttendu = 150.0;
        when(lotRepository.calculerStockTheorique(articleId, depotId))
                .thenReturn(stockAttendu);

        // When
        Double resultat = stockReservationService.calculerStockTheorique(articleId, depotId);

        // Then
        assertEquals(stockAttendu, resultat);
        verify(lotRepository, times(1)).calculerStockTheorique(articleId, depotId);
    }

    @Test
    void testCalculerStockReserve_AvecReservationsActives() {
        // Given
        Double reserveAttendue = 45.0; // Réservations avec valeur 10 et 20
        when(stockReservationRepository.calculerStockReserve(articleId, depotId))
                .thenReturn(reserveAttendue);

        // When
        Double resultat = stockReservationService.calculerStockReserve(articleId, depotId);

        // Then
        assertEquals(reserveAttendue, resultat);
        verify(stockReservationRepository, times(1)).calculerStockReserve(articleId, depotId);
    }

    @Test
    void testCalculerStockDisponible_StockSuffisant() {
        // Given
        Double stockTheorique = 150.0;
        Double stockReserve = 45.0;
        Double stockDisponibleAttendu = 105.0;

        when(lotRepository.calculerStockTheorique(articleId, depotId))
                .thenReturn(stockTheorique);
        when(stockReservationRepository.calculerStockReserve(articleId, depotId))
                .thenReturn(stockReserve);

        // When
        Double resultat = stockReservationService.calculerStockDisponible(articleId, depotId);

        // Then
        assertEquals(stockDisponibleAttendu, resultat);
    }

    @Test
    void testVerifierStockDisponible_QuantiteSuffisante() {
        // Given
        Double stockDisponible = 105.0;
        Double quantiteDemandee = 50.0;

        when(lotRepository.calculerStockTheorique(articleId, depotId))
                .thenReturn(150.0);
        when(stockReservationRepository.calculerStockReserve(articleId, depotId))
                .thenReturn(45.0);

        // When
        boolean resultat = stockReservationService.verifierStockDisponible(
                articleId, depotId, quantiteDemandee);

        // Then
        assertTrue(resultat, "Le stock devrait être suffisant");
    }

    @Test
    void testVerifierStockDisponible_QuantiteInsuffisante() {
        // Given
        Double stockTheorique = 150.0;
        Double stockReserve = 45.0;
        Double quantiteDemandee = 200.0; // Plus que disponible (105.0)

        when(lotRepository.calculerStockTheorique(articleId, depotId))
                .thenReturn(stockTheorique);
        when(stockReservationRepository.calculerStockReserve(articleId, depotId))
                .thenReturn(stockReserve);

        // When
        boolean resultat = stockReservationService.verifierStockDisponible(
                articleId, depotId, quantiteDemandee);

        // Then
        assertFalse(resultat, "Le stock devrait être insuffisant");
    }

    @Test
    void testCalculerStockDisponible_SansReservations() {
        // Given
        Double stockTheorique = 100.0;
        Double stockReserve = 0.0;

        when(lotRepository.calculerStockTheorique(articleId, depotId))
                .thenReturn(stockTheorique);
        when(stockReservationRepository.calculerStockReserve(articleId, depotId))
                .thenReturn(stockReserve);

        // When
        Double resultat = stockReservationService.calculerStockDisponible(articleId, depotId);

        // Then
        assertEquals(100.0, resultat, "Tout le stock devrait être disponible");
    }

    @Test
    void testCalculerStockDisponible_StockNegatif() {
        // Given - Plus de réservations que de stock physique (situation anormale)
        Double stockTheorique = 50.0;
        Double stockReserve = 75.0;

        when(lotRepository.calculerStockTheorique(articleId, depotId))
                .thenReturn(stockTheorique);
        when(stockReservationRepository.calculerStockReserve(articleId, depotId))
                .thenReturn(stockReserve);

        // When
        Double resultat = stockReservationService.calculerStockDisponible(articleId, depotId);

        // Then
        assertEquals(-25.0, resultat, "Le stock disponible peut être négatif en cas d'incohérence");
    }
}
