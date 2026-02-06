package com.app.gestion.ai.logging;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.app.gestion.ai.tool.ToolCall;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * Service de logging pour tracer les interactions avec l'IA
 */
@Slf4j
@Component
public class AiInteractionLogger {
    
    private final List<InteractionLog> logs = new ArrayList<>();
    private static final int MAX_LOGS = 1000;
    
    public void logToolCall(ToolCall call, Object result, boolean success, long executionTimeMs) {
        InteractionLog interactionLog = new InteractionLog();
        interactionLog.timestamp = LocalDateTime.now();
        interactionLog.toolName = call.getName();
        interactionLog.arguments = call.getArguments().toString();
        interactionLog.success = success;
        interactionLog.executionTimeMs = executionTimeMs;
        
        if (logs.size() >= MAX_LOGS) {
            logs.remove(0);
        }
        logs.add(interactionLog);
        
        log.info("Tool executed: {} - Success: {} - Duration: {}ms", 
            call.getName(), success, executionTimeMs);
    }
    
    public void logAiRequest(String prompt, String response, int iterations) {
        log.info("AI Request completed - Iterations: {} - Prompt length: {} - Response length: {}", 
            iterations, prompt.length(), response.length());
    }
    
    public List<InteractionLog> getRecentLogs(int count) {
        int size = logs.size();
        int fromIndex = Math.max(0, size - count);
        return new ArrayList<>(logs.subList(fromIndex, size));
    }
    
    @Data
    public static class InteractionLog {
        private LocalDateTime timestamp;
        private String toolName;
        private String arguments;
        private boolean success;
        private long executionTimeMs;
    }
}
