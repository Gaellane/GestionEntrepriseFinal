package com.app.gestion.ai.tool;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToolCall {
    private String name;
    private Map<String, Object> arguments;
    private String id; // ID unique du tool call pour la réponse
}
