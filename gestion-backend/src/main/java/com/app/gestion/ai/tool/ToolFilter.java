package com.app.gestion.ai.tool;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ToolFilter {
    
    private static final Map<String, Set<String>> DOMAIN_KEYWORDS = new HashMap<>();
    
    static {
        // Map domaines français -> mots clés
        DOMAIN_KEYWORDS.put("stock", Set.of(
            "stock", "inventaire", "article", "quantité", "disponible", "réserve", 
            "sortie", "entrée", "mouvement", "dépôt", "unité", "lot", "produit"
        ));
        
        DOMAIN_KEYWORDS.put("achat", Set.of(
            "achat", "fournisseur", "commande", "approvisionnement", "devis", 
            "bon de commande", "reception", "facture achat", "prix achat", "cout"
        ));
        
        DOMAIN_KEYWORDS.put("vente", Set.of(
            "vente", "client", "devis", "proforma", "facture", "commande client", 
            "livraison", "remise", "prix de vente", "tarif", "facturer"
        ));
        
        DOMAIN_KEYWORDS.put("livraison", Set.of(
            "livraison", "transport", "adresse", "suivi livraison", "statut livraison"
        ));
        
        DOMAIN_KEYWORDS.put("inventaire", Set.of(
            "inventaire", "comptage", "ajustement", "discrepancy", "physique", 
            "controle", "verification"
        ));
        
        DOMAIN_KEYWORDS.put("caisse", Set.of(
            "caisse", "encaissement", "paiement", "remboursement", 
            "solde", "tresorerie", "cash", "mouvement caisse"
        ));
        
        DOMAIN_KEYWORDS.put("kpi", Set.of(
            "kpi", "rapport", "statistique", "analyse", "graphique", "comparaison", 
            "tendance", "performance", "chiffre", "total", "moyenne", "dashboard"
        ));
        
        DOMAIN_KEYWORDS.put("configuration", Set.of(
            "configuration", "parametre", "setting", "tva", "entreprise", "depot", 
            "entity"
        ));
        
        DOMAIN_KEYWORDS.put("audit", Set.of(
            "audit", "historique", "log", "trace", "action", 
            "modification", "qui a fait", "quand"
        ));
        
        // admin domain - utilisateurs et rôles
        DOMAIN_KEYWORDS.put("admin", Set.of(
            "utilisateur", "utilisateurs", "user", "users", "employe", "staff", 
            "compte", "comptes", "acces", "role", "roles", "permission", "droit",
            "appli", "application", "admin", "administrateur"
        ));
    }
    
    /**
     * Filtre les tools en fonction du prompt
     * Retourne les tools pertinents + les tools généraux
     */
    public static List<ToolDefinition> filterByPrompt(
            List<ToolDefinition> allTools,
            String prompt,
            int maxTools) {
        
        if (allTools == null || allTools.isEmpty()) {
            return allTools;
        }
        
        String promptLower = prompt.toLowerCase();
        Set<String> relevantDomains = new HashSet<>();
        relevantDomains.add("general");
        relevantDomains.add("admin");
        
        // Analyser le prompt pour identifier les domaines
        for (Map.Entry<String, Set<String>> entry : DOMAIN_KEYWORDS.entrySet()) {
            String domain = entry.getKey();
            Set<String> keywords = entry.getValue();
            
            // Si au moins 1 mot-clé du domaine est présent, ajouter le domaine
            if (keywords.stream().anyMatch(promptLower::contains)) {
                relevantDomains.add(domain);
            }
        }
        
        log.debug("Prompt analysis detected domains: {}", relevantDomains);
        
        // Filtrer les tools par domaines pertinents
        List<ToolDefinition> filteredTools = allTools.stream()
            .filter(tool -> {
                String toolDomain = tool.getAnnotation().domain();
                return relevantDomains.contains(toolDomain);
            })
            .limit(maxTools)
            .toList();
        
        int originalCount = allTools.size();
        int filteredCount = filteredTools.size();
        
        log.info("Tool filtering: {} tools → {} tools (max: {})", 
            originalCount, filteredCount, maxTools);
        
        return filteredTools;
    }
    
    /**
     * Surcharge avec max tools par défaut = 15
     */
    public static List<ToolDefinition> filterByPrompt(
            List<ToolDefinition> allTools,
            String prompt) {
        return filterByPrompt(allTools, prompt, 15);
    }
}
