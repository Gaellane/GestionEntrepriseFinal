package com.app.gestion.ai.security;

import com.app.gestion.ai.tool.AiTool;
import com.app.gestion.ai.tool.ToolDefinition;

public class ToolPermissionService {
    public static boolean isAllowed(
            ToolDefinition tool,
            UserContext user
    ) {
        AiTool meta = tool.getAnnotation();

        if (meta.dangerous()) return false;

        if (meta.rolesAllowed().length == 0) return true;

        for (String role : meta.rolesAllowed()) {
            if (user.hasRole(role)) return true;
        }
        return false;
    }
}
