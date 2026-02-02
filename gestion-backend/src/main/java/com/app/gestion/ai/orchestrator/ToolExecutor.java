package com.app.gestion.ai.orchestrator;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.app.gestion.ai.security.ToolPermissionService;
import com.app.gestion.ai.security.UserContext;
import com.app.gestion.ai.tool.ToolCall;
import com.app.gestion.ai.tool.ToolDefinition;
import com.app.gestion.ai.tool.ToolRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ToolExecutor {
    
    private final ToolRegistry registry;
    private final ObjectMapper objectMapper;
    
    public Object execute(ToolCall call, UserContext user) {
        try {
            ToolDefinition tool = findTool(call.getName());
            
            validatePermissions(tool, user);
            validateArguments(tool, call.getArguments());
            
            Object[] args = convertArguments(tool, call.getArguments());
            
            log.debug("Executing tool: {} with {} arguments", call.getName(), args.length);
            
            Object result = tool.getMethod().invoke(tool.getBean(), args);
            
            log.debug("Tool {} executed successfully", call.getName());
            
            return result;
            
        } catch (Exception e) {
            log.error("Error executing tool: {}", call.getName(), e);
            throw new RuntimeException("Tool execution failed: " + e.getMessage(), e);
        }
    }
    
    private ToolDefinition findTool(String name) {
        return registry.getAllTools().stream()
            .filter(t -> t.getName().equals(name))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Tool not found: " + name));
    }
    
    private void validatePermissions(ToolDefinition tool, UserContext user) {
        if (!ToolPermissionService.isAllowed(tool, user)) {
            throw new SecurityException("User not allowed to execute tool: " + tool.getName());
        }
    }
    
    private void validateArguments(ToolDefinition tool, Map<String, Object> arguments) {
        Map<String, Object> schema = tool.getParametersSchema();
        
        @SuppressWarnings("unchecked")
        List<String> required = (List<String>) schema.get("required");
        
        if (required != null) {
            for (String param : required) {
                if (!arguments.containsKey(param)) {
                    throw new IllegalArgumentException(
                        "Missing required parameter: " + param + " for tool: " + tool.getName());
                }
            }
        }
    }
    
    private Object[] convertArguments(ToolDefinition tool, Map<String, Object> arguments) {
        Method method = tool.getMethod();
        Parameter[] parameters = method.getParameters();
        List<Object> convertedArgs = new ArrayList<>();
        
        for (Parameter param : parameters) {
            String paramName = param.getName();
            Object value = arguments.get(paramName);
            
            if (value == null) {
                convertedArgs.add(null);
            } else {
                // Convert to the right type
                Object converted = objectMapper.convertValue(value, param.getType());
                convertedArgs.add(converted);
            }
        }
        
        return convertedArgs.toArray();
    }
}
