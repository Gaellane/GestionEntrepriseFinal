package com.app.gestion.ai.tool;

import java.util.List;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import com.app.gestion.ai.security.ToolPermissionService;
import com.app.gestion.ai.security.UserContext;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ToolRegistry {
    private final ApplicationContext context;
    private List<ToolDefinition> allTools;

    public List<ToolDefinition> getAllowedTools(UserContext user) {
        if (allTools == null) {
            allTools = scanTools();
        }
        return allTools.stream()
                .filter(t -> ToolPermissionService.isAllowed(t, user))
                .toList();
    }
    
    public List<ToolDefinition> getAllTools() {
        if (allTools == null) {
            allTools = scanTools();
        }
        return allTools;
    }
    
    private List<ToolDefinition> scanTools() {
        ToolScanner scanner = new ToolScanner(context);
        return scanner.scan();
    }
}
