package com.app.gestion.ai.tool;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ToolSchemaBuilder {
    
    public static Map<String, Object> fromMethod(Method method) {
        Map<String, Object> schema = new HashMap<>();

        Map<String, Object> properties = new HashMap<>();
        List<String> required = new ArrayList<>();

        for (Parameter param : method.getParameters()) {
            Class<?> paramType = param.getType();
            Map<String, Object> prop = buildPropertySchema(paramType, param.getParameterizedType());
            
            // Add description
            prop.put("description", generateDescription(param));

            properties.put(param.getName(), prop);
            
            // Only mark primitive types as required (not nullable wrapper types)
            if (paramType.isPrimitive()) {
                required.add(param.getName());
            }
        }

        schema.put("type", "object");
        schema.put("properties", properties);
        
        // Only add required if there are required params
        if (!required.isEmpty()) {
            schema.put("required", required);
        }

        return schema;
    }
    
    /**
     * Builds the JSON Schema for a parameter type
     */
    private static Map<String, Object> buildPropertySchema(Class<?> type, Type genericType) {
        Map<String, Object> prop = new HashMap<>();
        
        // Handle nullable numeric types - accept integer, string, or null
        if (isNullableNumericType(type)) {
            List<Map<String, String>> oneOf = new ArrayList<>();
            oneOf.add(Map.of("type", "integer"));
            oneOf.add(Map.of("type", "string"));
            oneOf.add(Map.of("type", "null"));
            prop.put("oneOf", oneOf);
            return prop;
        }
        
        // Handle primitive numeric types (not nullable)
        if (isPrimitiveNumericType(type)) {
            prop.put("type", "integer");
            return prop;
        }
        
        // Handle primitive double/float
        if (type == double.class || type == float.class) {
            prop.put("type", "number");
            return prop;
        }
        
        // Handle nullable Double/Float
        if (type == Double.class || type == Float.class) {
            List<Map<String, String>> oneOf = new ArrayList<>();
            oneOf.add(Map.of("type", "number"));
            oneOf.add(Map.of("type", "string"));
            oneOf.add(Map.of("type", "null"));
            prop.put("oneOf", oneOf);
            return prop;
        }
        
        // Handle Boolean
        if (type == Boolean.class) {
            List<Map<String, String>> oneOf = new ArrayList<>();
            oneOf.add(Map.of("type", "boolean"));
            oneOf.add(Map.of("type", "null"));
            prop.put("oneOf", oneOf);
            return prop;
        }
        
        if (type == boolean.class) {
            prop.put("type", "boolean");
            return prop;
        }
        
        // Handle String
        if (type == String.class) {
            prop.put("type", "string");
            return prop;
        }
        
        // Handle dates as strings
        if (type == LocalDate.class || type == LocalDateTime.class) {
            List<Map<String, String>> oneOf = new ArrayList<>();
            oneOf.add(Map.of("type", "string"));
            oneOf.add(Map.of("type", "null"));
            prop.put("oneOf", oneOf);
            return prop;
        }
        
        // Handle arrays and collections
        if (type.isArray() || Collection.class.isAssignableFrom(type)) {
            prop.put("type", "array");
            
            // Try to get the element type
            Class<?> elementType = getCollectionElementType(type, genericType);
            if (elementType != null && !elementType.equals(Object.class)) {
                prop.put("items", buildPropertySchema(elementType, elementType));
            } else {
                prop.put("items", Map.of("type", "string"));
            }
            return prop;
        }
        
        // Handle complex objects (DTOs, etc.)
        if (isComplexType(type)) {
            return buildObjectSchema(type);
        }
        
        // Default to string for unknown types
        prop.put("type", "string");
        return prop;
    }
    
    /**
     * Builds schema for complex object types (DTOs)
     */
    private static Map<String, Object> buildObjectSchema(Class<?> type) {
        Map<String, Object> schema = new HashMap<>();
        schema.put("type", "object");
        
        Map<String, Object> properties = new HashMap<>();
        List<String> required = new ArrayList<>();
        
        // Get all declared fields (including from parent classes)
        Class<?> currentClass = type;
        while (currentClass != null && currentClass != Object.class) {
            for (Field field : currentClass.getDeclaredFields()) {
                // Skip static and synthetic fields
                if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) 
                    || field.isSynthetic()) {
                    continue;
                }
                
                String fieldName = field.getName();
                Class<?> fieldType = field.getType();
                
                Map<String, Object> fieldSchema = buildPropertySchema(fieldType, field.getGenericType());
                fieldSchema.put("description", fieldName);
                properties.put(fieldName, fieldSchema);
                
                // Primitives are required
                if (fieldType.isPrimitive()) {
                    required.add(fieldName);
                }
            }
            currentClass = currentClass.getSuperclass();
        }
        
        schema.put("properties", properties);
        if (!required.isEmpty()) {
            schema.put("required", required);
        }
        
        return schema;
    }
    
    private static boolean isNullableNumericType(Class<?> type) {
        return type == Integer.class || type == Long.class;
    }
    
    private static boolean isPrimitiveNumericType(Class<?> type) {
        return type == int.class || type == long.class;
    }
    
    private static boolean isComplexType(Class<?> type) {
        // Check if it's a custom class (not JDK, not primitive, not common types)
        if (type.isPrimitive()) return false;
        if (type.getName().startsWith("java.")) return false;
        if (type.getName().startsWith("javax.")) return false;
        if (type.isEnum()) return false;
        if (type.isArray()) return false;
        if (Collection.class.isAssignableFrom(type)) return false;
        if (Map.class.isAssignableFrom(type)) return false;
        
        // It's likely a DTO or custom object
        return true;
    }
    
    private static Class<?> getCollectionElementType(Class<?> type, Type genericType) {
        if (type.isArray()) {
            return type.getComponentType();
        }
        
        if (genericType instanceof ParameterizedType) {
            ParameterizedType paramType = (ParameterizedType) genericType;
            Type[] typeArgs = paramType.getActualTypeArguments();
            if (typeArgs.length > 0 && typeArgs[0] instanceof Class) {
                return (Class<?>) typeArgs[0];
            }
        }
        
        return Object.class;
    }
    
    private static String generateDescription(Parameter param) {
        Class<?> type = param.getType();
        String name = param.getName();
        
        if (isNullableNumericType(type)) {
            return name + " (ID numérique optionnel, ex: 1, 2, 3 ou omettre si non spécifié)";
        }
        if (type == LocalDate.class) {
            return name + " (format: YYYY-MM-DD, ex: 2024-01-15, optionnel)";
        }
        if (type == LocalDateTime.class) {
            return name + " (format: YYYY-MM-DDTHH:mm:ss, optionnel)";
        }
        if (type == Boolean.class) {
            return name + " (true ou false, optionnel)";
        }
        if (type == boolean.class) {
            return name + " (true ou false)";
        }
        if (isPrimitiveNumericType(type)) {
            return name + " (ID numérique requis)";
        }
        if (isComplexType(type)) {
            return name + " (objet " + type.getSimpleName() + ")";
        }
        return name;
    }
}
