package com.app.gestion.ai.tool;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ToolSchemaBuilder {
    
    public static Map<String, Object> fromMethod(Method method) {
        Map<String, Object> schema = new HashMap<>();

        Map<String, Object> properties = new HashMap<>();
        List<String> required = new ArrayList<>();

        for (Parameter param : method.getParameters()) {
            Map<String, Object> prop = new HashMap<>();
            prop.put("type", mapType(param.getType()));
            prop.put("description", param.getName());

            properties.put(param.getName(), prop);
            required.add(param.getName());
        }

        schema.put("type", "object");
        schema.put("properties", properties);
        schema.put("required", required);

        return schema;
    }

    private static String mapType(Class<?> type) {
        if (type == String.class) return "string";
        if (type == Integer.class || type == int.class) return "integer";
        if (type == Long.class || type == long.class) return "integer";
        if (type == Boolean.class || type == boolean.class) return "boolean";
        return "object";
    }
}
