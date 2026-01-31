package com.app.gestion.model.enums;

/**
 * Statut d'un lot de stock
 */
public enum StatutLot {
    /**
     * Lot actif et disponible pour utilisation
     */
    ACTIF,
    
    /**
     * Lot bloqué manuellement (non-conformité, défaut qualité, etc.)
     */
    BLOQUE,
    
    /**
     * Lot avec Date Limite de Consommation (DLC) dépassée - blocage automatique
     */
    EXPIRE_DLC,
    
    /**
     * Lot avec Date Limite d'Utilisation Optimale (DLUO) dépassée - alerte mais utilisable
     */
    EXPIRE_DLUO
}
