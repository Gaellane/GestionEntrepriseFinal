package com.app.gestion.ai.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String prompt;
    private String conversationId; // pour les conversations multi-tours
    private List<String> allowedTools; // restreindre les outils disponibles
}
