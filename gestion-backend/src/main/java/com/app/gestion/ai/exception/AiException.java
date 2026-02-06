package com.app.gestion.ai.exception;

public class AiException extends RuntimeException {
    
    public AiException(String message) {
        super(message);
    }
    
    public AiException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static class ToolNotFoundException extends AiException {
        public ToolNotFoundException(String toolName) {
            super("Tool not found: " + toolName);
        }
    }
    
    public static class ToolExecutionException extends AiException {
        public ToolExecutionException(String toolName, Throwable cause) {
            super("Failed to execute tool: " + toolName, cause);
        }
    }
    
    public static class PermissionDeniedException extends AiException {
        public PermissionDeniedException(String toolName) {
            super("Permission denied for tool: " + toolName);
        }
    }
    
    public static class LlmApiException extends AiException {
        public LlmApiException(String message, Throwable cause) {
            super("LLM API error: " + message, cause);
        }
    }
    
    public static class MaxIterationsException extends AiException {
        public MaxIterationsException() {
            super("Maximum AI iterations reached");
        }
    }
}
