package com.app.gestion.model.enums;

public enum StatutLot {
    ACTIF,              // Lot utilisable normalement
    BLOQUE,             // Lot bloqué manuellement (non conforme, etc.)
    EXPIRE_DLC,         // DLC dépassée - blocage automatique
    EXPIRE_DLUO         // DLUO dépassée - alerte mais utilisable
}
