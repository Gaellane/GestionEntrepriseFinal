package com.app.gestion.ai.llm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Data;

@Data
public class Message {
    private static final ObjectMapper mapper = new ObjectMapper();
    
    private String role;
    private String content;
    private String name; // pour les tools
    private List<Map<String, Object>> toolCalls; // pour les appels d'outils
    private String toolCallId; // pour les réponses d'outils

    private Message(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public static Message system(String content) {
        return new Message("system", content);
    }

    public static Message user(String content) {
        return new Message("user", content);
    }

    public static Message assistant(String content) {
        return new Message("assistant", content);
    }

    public static Message toolResult(String toolCallId, String toolName, Object result) {
        Message m = new Message("tool", toJson(result));
        m.name = toolName;
        m.toolCallId = toolCallId;
        return m;
    }
    
    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("role", role);
        
        // Ajouter le contenu en priorité
        if (content != null && !content.isEmpty()) {
            map.put("content", content);
        }
        
        // Pour les réponses d'outils
        if (toolCallId != null && !toolCallId.isEmpty()) {
            map.put("tool_call_id", toolCallId);
        }
        
        // Pour les messages avec nom (tool responses)
        if (name != null && !name.isEmpty()) {
            map.put("name", name);
        }
        
        return map;
    }
    
    private static String toJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return obj.toString();
        }
    }
}
