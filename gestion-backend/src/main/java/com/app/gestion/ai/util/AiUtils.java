package com.app.gestion.ai.util;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.app.gestion.ai.tool.ToolDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Utilitaires pour l'AI module
 */
public class AiUtils {
    
    private static final ObjectMapper mapper = new ObjectMapper();
    
    /**
     * Convertit un objet en JSON
     */
    public static String toJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj != null ? obj.toString() : "null";
        }
    }
    
    /**
     * Parse un JSON en Map
     */
    public static Map<String, Object> fromJson(String json) {
        try {
            return mapper.readValue(json, 
                mapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    /**
     * Formate les noms de paramètres de manière lisible
     */
    public static String formatParameterName(String paramName) {
        // camelCase -> snake_case pour les LLMs
        return paramName.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
    
    /**
     * Crée un message d'erreur formaté pour le LLM
     */
    public static Map<String, Object> errorResponse(String message, String code) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        error.put("code", code);
        return error;
    }
    
    /**
     * Crée un message de succès formaté pour le LLM
     */
    public static Map<String, Object> successResponse(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return response;
    }
    
    /**
     * Extrait les noms de paramètres d'une méthode
     */
    public static List<String> extractParameterNames(Method method) {
        List<String> names = new ArrayList<>();
        for (var param : method.getParameters()) {
            names.add(param.getName());
        }
        return names;
    }
    
    /**
     * Valide qu'une chaîne est un JSON valide
     */
    public static boolean isValidJson(String json) {
        try {
            mapper.readTree(json);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
