package com.app.gestion.ai.orchestrator;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.app.gestion.ai.llm.GroqClient;
import com.app.gestion.ai.llm.GroqResponse;
import com.app.gestion.ai.llm.Message;
import com.app.gestion.ai.prompt.SystemPromptBuilder;
import com.app.gestion.ai.security.UserContext;
import com.app.gestion.ai.tool.ToolCall;
import com.app.gestion.ai.tool.ToolDefinition;
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

    public String handlePrompt(String prompt, UserContext user) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "Veuillez fournir une question ou une demande.";
        }

        List<ToolDefinition> tools = registry.getAllowedTools(user);

        List<Message> messages = new ArrayList<>();
        messages.add(Message.system(SystemPromptBuilder.build()));
        messages.add(Message.user(prompt));

        for (int i = 0; i < 5; i++) {
            log.info("AI iteration {}/5", i + 1);
            
            GroqResponse response = groq.chat(messages, tools);

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
                
                log.info("AI requested tool: {}", call.getName());
                
                try {
                    Object result = executor.execute(call, user);
                    messages.add(Message.toolResult(call.getId(), call.getName(), result));
                    log.debug("Tool executed successfully, continuing conversation");
                } catch (Exception e) {
                    log.error("Tool execution failed for: {}", call.getName(), e);
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
        return "Désolé, je n'ai pas pu terminer le traitement de votre demande dans le nombre d'itérations autorisées.";
    }
}
