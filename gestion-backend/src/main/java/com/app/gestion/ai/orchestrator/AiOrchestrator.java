package com.app.gestion.ai.orchestrator;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.app.gestion.ai.llm.GroqClient;
import com.app.gestion.ai.llm.GroqResponse;
import com.app.gestion.ai.llm.Message;
import com.app.gestion.ai.prompt.SystemPromptBuilder;
import com.app.gestion.ai.security.UserContext;
import com.app.gestion.ai.tool.ToolCall;
import com.app.gestion.ai.tool.ToolDefinition;
import com.app.gestion.ai.tool.ToolFilter;
import com.app.gestion.ai.tool.ToolRegistry;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiOrchestrator {
    private final GroqClient groq;
    private final ToolRegistry registry;
    private final ToolExecutor executor;
    
    // Maximum iterations pour éviter les boucles infinies
    private static final int MAX_ITERATIONS = 5;
    // Nombre maximum de tools à envoyer pour économiser les tokens
    private static final int MAX_TOOLS = 8;
    // Maximum d'appels au même outil avant de forcer une réponse
    private static final int MAX_SAME_TOOL_CALLS = 1;
    
    // Mots-clés indiquant une requête simple (sans besoin d'outils)
    private static final Set<String> SIMPLE_QUERY_PATTERNS = Set.of(
        "bonjour", "salut", "hello", "hi", "coucou",
        "comment ça va", "comment ca va", "ca va", "ça va",
        "merci", "thanks", "thank you",
        "au revoir", "bye", "à bientôt",
        "qui es-tu", "qui es tu", "tu es qui", "c'est quoi ton nom",
        "aide", "help", "comment fonctionne"
    );

    public String handlePrompt(String prompt, UserContext user) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "Veuillez fournir une question ou une demande.";
        }
        
        String promptLower = prompt.toLowerCase().trim();
        
        // Vérifier si c'est une requête simple qui ne nécessite pas d'outils
        if (isSimpleQuery(promptLower)) {
            log.info("Detected simple query, using fast model without tools");
            return handleSimpleQuery(prompt);
        }

        // Récupérer tous les tools autorisés
        List<ToolDefinition> allAllowedTools = registry.getAllowedTools(user);
        
        // Filtrer les tools en fonction du prompt pour réduire tokens
        List<ToolDefinition> tools = ToolFilter.filterByPrompt(allAllowedTools, prompt, MAX_TOOLS);
        
        log.info("Processing prompt with {} filtered tools out of {} total allowed", 
            tools.size(), allAllowedTools.size());

        List<Message> messages = new ArrayList<>();
        messages.add(Message.system(SystemPromptBuilder.buildCompact()));
        messages.add(Message.user(prompt));
        
        // Track tool calls to detect loops
        Map<String, Integer> toolCallCount = new HashMap<>();

        for (int i = 0; i < MAX_ITERATIONS; i++) {
            log.info("AI iteration {}/{}", i + 1, MAX_ITERATIONS);
            
            // Truncate message history if too long to save tokens
            List<Message> truncatedMessages = truncateMessages(messages);
            
            GroqResponse response = groq.chat(truncatedMessages, tools);

            if (response == null) {
                log.error("Received null response from Groq");
                return "Erreur: réponse invalide du service IA.";
            }

            if (response.isToolCall()) {
                ToolCall call = response.getToolCall();
                
                if (call == null || call.getName() == null) {
                    log.error("Invalid tool call received");
                    return "Erreur: appel d'outil invalide.";
                }
                
                String toolName = call.getName();
                int callCount = toolCallCount.getOrDefault(toolName, 0) + 1;
                toolCallCount.put(toolName, callCount);
                
                log.info("AI requested tool: {} (call #{} for this tool)", toolName, callCount);
                
                // Detect loop - same tool called too many times
                if (callCount > MAX_SAME_TOOL_CALLS) {
                    log.warn("Tool {} called {} times, forcing response", toolName, callCount);
                    // Force AI to respond with what it has
                    messages.add(Message.system(
                        "STOP: Tu as déjà appelé l'outil '" + toolName + "' et obtenu les résultats. " +
                        "RÉPONDS MAINTENANT à l'utilisateur avec les données que tu as reçues. " +
                        "NE RAPPELLE PAS cet outil."
                    ));
                    // Remove tools to force text response
                    tools = List.of();
                    continue;
                }
                
                try {
                    Object result = executor.execute(call, user);
                    // Truncate tool results if too large
                    String resultStr = truncateToolResult(result);
                    
                    // DEBUG: Log the tool result
                    log.info("Tool {} returned result (length={} chars): {}", 
                        toolName, resultStr.length(), 
                        resultStr.length() > 500 ? resultStr.substring(0, 500) + "..." : resultStr);
                    
                    // IMPORTANT: Add assistant message with tool_calls FIRST
                    messages.add(Message.assistantToolCall(call.getId(), call.getName(), call.getArguments()));
                    // THEN add the tool result
                    messages.add(Message.toolResult(call.getId(), call.getName(), resultStr));
                    
                    log.debug("Tool executed successfully, added assistant+tool messages");
                } catch (Exception e) {
                    log.error("Tool execution failed for: {}", call.getName(), e);
                    // Add assistant message with tool_calls
                    messages.add(Message.assistantToolCall(call.getId(), call.getName(), call.getArguments()));
                    // Inform AI about the error
                    messages.add(Message.toolResult(
                        call.getId(), 
                        call.getName(), 
                        "Error: " + e.getMessage()
                    ));
                }
            } else {
                String answer = response.getFinalAnswer();
                if (answer == null || answer.trim().isEmpty()) {
                    log.warn("Empty answer from AI");
                    return "Je n'ai pas pu générer une réponse appropriée.";
                }
                log.info("AI provided final answer");
                return answer;
            }
        }
        
        log.warn("Maximum AI iterations reached");
        return "La requête est trop complexe. Veuillez la simplifier ou poser des questions plus ciblées.";
    }
    
    /**
     * Vérifie si la requête est simple (salutations, questions générales)
     */
    private boolean isSimpleQuery(String promptLower) {
        // Requête très courte (moins de 15 caractères) = probablement simple
        if (promptLower.length() < 15) {
            return SIMPLE_QUERY_PATTERNS.stream()
                .anyMatch(pattern -> promptLower.contains(pattern) || pattern.contains(promptLower));
        }
        return SIMPLE_QUERY_PATTERNS.stream().anyMatch(promptLower::contains);
    }
    
    /**
     * Traite une requête simple avec le modèle rapide sans outils
     */
    private String handleSimpleQuery(String prompt) {
        List<Message> messages = new ArrayList<>();
        messages.add(Message.system(
            "Tu es un assistant sympathique pour un système de gestion d'entreprise. " +
            "Réponds de manière concise et professionnelle en français."
        ));
        messages.add(Message.user(prompt));
        
        try {
            GroqResponse response = groq.chatFast(messages);
            if (response != null && response.getFinalAnswer() != null) {
                return response.getFinalAnswer();
            }
        } catch (Exception e) {
            log.error("Error in simple query handling", e);
        }
        
        return "Bonjour ! Comment puis-je vous aider avec la gestion de votre entreprise ?";
    }
    
    /**
     * Tronque l'historique des messages pour économiser les tokens
     */
    private List<Message> truncateMessages(List<Message> messages) {
        // Garder le system prompt (premier) + les 6 derniers messages max
        if (messages.size() <= 7) {
            return messages;
        }
        
        List<Message> truncated = new ArrayList<>();
        truncated.add(messages.get(0)); // System prompt
        
        // Ajouter un résumé pour l'IA
        truncated.add(Message.system("[Conversation précédente tronquée pour économiser les tokens]"));
        
        // Garder les 5 derniers messages
        int startIndex = messages.size() - 5;
        for (int i = startIndex; i < messages.size(); i++) {
            truncated.add(messages.get(i));
        }
        
        log.debug("Truncated messages from {} to {}", messages.size(), truncated.size());
        return truncated;
    }
    
    /**
     * Tronque les résultats d'outils trop volumineux
     */
    private String truncateToolResult(Object result) {
        if (result == null) {
            return "null";
        }
        
        String resultStr = result.toString();
        final int MAX_RESULT_LENGTH = 3000; // Max 3000 caractères par résultat
        
        if (resultStr.length() > MAX_RESULT_LENGTH) {
            log.warn("Truncating tool result from {} to {} chars", resultStr.length(), MAX_RESULT_LENGTH);
            return resultStr.substring(0, MAX_RESULT_LENGTH) + "\n...[résultat tronqué, " + 
                (resultStr.length() - MAX_RESULT_LENGTH) + " caractères omis]";
        }
        
        return resultStr;
    }
}
