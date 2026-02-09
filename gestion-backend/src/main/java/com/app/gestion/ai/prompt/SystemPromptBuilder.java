package com.app.gestion.ai.prompt;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class SystemPromptBuilder {
    
    /**
     * Prompt système complet (pour référence, non utilisé en production)
     */
    public static String build() {
        return String.format("""
        Tu es un assistant pour un système de gestion d'entreprise.
        Date: %s
        
        RÈGLES:
        - N'invente JAMAIS de données - utilise les outils disponibles
        - Appelle les outils quand nécessaire
        - Réponds en français, de manière concise
        - En cas d'erreur d'outil, explique et propose une alternative
        """, LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
    }
    
    /**
     * Prompt système compact pour économiser les tokens
     */
    public static String buildCompact() {
        return String.format("""
        Assistant gestion d'entreprise. Date: %s
        RÈGLES CRITIQUES:
        - Utilise un outil UNE SEULE FOIS maximum - ne répète jamais le même appel
        - Après avoir reçu le résultat d'un outil, utilise ces données pour répondre
        - Pour les paramètres optionnels (depotId, categoryId, etc.), omets-les si non spécifiés
        - N'invente JAMAIS de valeurs - si l'info manque, demande à l'utilisateur
        - Réponds en français, sois concis et direct
        """, LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
    }
    
    public static String buildWithContext(String userRole, String domain) {
        return buildCompact() + String.format(" Rôle: %s, Domaine: %s", userRole, domain);
    }
}
