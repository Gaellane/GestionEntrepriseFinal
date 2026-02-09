package com.app.gestion.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.ai.dto.ChatRequest;
import com.app.gestion.ai.dto.ChatResponse;
import com.app.gestion.ai.orchestrator.AiOrchestrator;
import com.app.gestion.ai.security.UserContext;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    
    private final AiOrchestrator orchestrator;
    
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            log.info("Received AI chat request: {}", request.getPrompt());
            
            UserContext user = UserContext.fromSecurityContext();
            
            String answer = orchestrator.handlePrompt(request.getPrompt(), user);
            
            return ResponseEntity.ok(new ChatResponse(answer));
            
        } catch (Exception e) {
            log.error("Error processing AI request", e);
            
            String errorMessage = e.getMessage();
            HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
            
            // Handle rate limit errors gracefully
            if (errorMessage != null && (errorMessage.contains("rate_limit") || errorMessage.contains("429"))) {
                status = HttpStatus.TOO_MANY_REQUESTS;
                errorMessage = "Le service IA est temporairement surchargé. Veuillez réessayer dans quelques secondes.";
            } else if (errorMessage != null && errorMessage.contains("Limite de requêtes")) {
                status = HttpStatus.TOO_MANY_REQUESTS;
            } else {
                errorMessage = "Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.";
            }
            
            return ResponseEntity.status(status).body(new ChatResponse(errorMessage));
        }
    }
}
