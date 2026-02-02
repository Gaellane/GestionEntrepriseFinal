package com.app.gestion.controller;

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
            return ResponseEntity.internalServerError()
                .body(new ChatResponse("Erreur: " + e.getMessage()));
        }
    }
}
