package com.app.gestion.ai.tool;

import java.lang.reflect.Method;
import java.util.Map;

import lombok.Data;

@Data
public class ToolDefinition {
    private String name;
    private String description;
    private Map<String, Object> parametersSchema;

    private Object bean;
    private Method method;

    private AiTool annotation;

    public static ToolDefinition from(
            Object bean,
            Method method,
            AiTool annotation
    ) {
        ToolDefinition def = new ToolDefinition();
        def.name = annotation.name();
        def.description = annotation.description();
        def.bean = bean;
        def.method = method;
        def.annotation = annotation;

        def.parametersSchema = ToolSchemaBuilder.fromMethod(method);
        return def;
    } 
}
