package com.app.gestion.model.enums;

public enum TypePeremption {
    AUCUNE,    // Pas de date de péremption
    DLUO,      // Date Limite d'Utilisation Optimale - alerte mais pas de blocage automatique
    DLC        // Date Limite de Consommation - blocage automatique
}
