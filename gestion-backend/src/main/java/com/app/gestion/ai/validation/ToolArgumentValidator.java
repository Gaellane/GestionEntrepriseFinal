package com.app.gestion.ai.validation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Validateur pour les arguments des outils
 */
@Component
public class ToolArgumentValidator {
    
    public ValidationResult validate(Map<String, Object> schema, Map<String, Object> arguments) {
        List<String> errors = new ArrayList<>();
        
        // Vérifier les champs requis
        @SuppressWarnings("unchecked")
        List<String> required = (List<String>) schema.get("required");
        if (required != null) {
            for (String field : required) {
                if (!arguments.containsKey(field) || arguments.get(field) == null) {
                    errors.add("Missing required field: " + field);
                }
            }
        }
        
        // Vérifier les types
        @SuppressWarnings("unchecked")
        Map<String, Object> properties = (Map<String, Object>) schema.get("properties");
        if (properties != null) {
            for (Map.Entry<String, Object> entry : arguments.entrySet()) {
                String fieldName = entry.getKey();
                Object value = entry.getValue();
                
                if (properties.containsKey(fieldName)) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> fieldSchema = (Map<String, Object>) properties.get(fieldName);
                    String expectedType = (String) fieldSchema.get("type");
                    
                    if (!isTypeValid(value, expectedType)) {
                        errors.add(String.format("Invalid type for field '%s': expected %s", 
                            fieldName, expectedType));
                    }
                }
            }
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    private boolean isTypeValid(Object value, String expectedType) {
        if (value == null) return true;
        
        return switch (expectedType) {
            case "string" -> value instanceof String;
            case "integer" -> value instanceof Integer || value instanceof Long;
            case "number" -> value instanceof Number;
            case "boolean" -> value instanceof Boolean;
            case "object" -> value instanceof Map;
            case "array" -> value instanceof List;
            default -> true;
        };
    }
    
    public record ValidationResult(boolean isValid, List<String> errors) {
        public String getErrorMessage() {
            return String.join(", ", errors);
        }
    }
}
