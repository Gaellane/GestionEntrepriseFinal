package com.app.gestion.ai.llm;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.app.gestion.ai.tool.ToolDefinition;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import reactor.netty.http.client.HttpClient;

@Slf4j
@Component
public class GroqClient {
    
    @Value("${groq.api.key:}")
    private String apiKey;
    
    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String model;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public GroqClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        HttpClient httpClient = HttpClient.create()
            // Timeout réseau
            .responseTimeout(Duration.ofSeconds(45));

        this.webClient = WebClient.builder()
            .baseUrl("https://api.groq.com/openai/v1")
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.USER_AGENT, "gestion-ai/1.0")
            .codecs(configurer ->
                configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)
            )
            .build();
    }
    
    public GroqResponse chat(List<Message> messages, List<ToolDefinition> tools) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("Groq API key not configured. Set groq.api.key in application.properties");
        }
        
        try {
            Map<String, Object> requestBody = buildRequestBody(messages, tools);
            
            log.info("Calling Groq API with {} messages and {} tools", messages.size(), 
                tools != null ? tools.size() : 0);
            
            if (log.isDebugEnabled()) {
                try {
                    log.debug("Request payload: {}", objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestBody));
                } catch (JsonProcessingException e) {
                    log.debug("Could not serialize request for logging");
                }
            }
                        
            String responseJson = webClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> response.bodyToMono(String.class)
                        .flatMap(errorBody -> {
                            log.error("Groq API error [{}]: {}", response.statusCode(), errorBody);
                            return reactor.core.publisher.Mono.error(
                                new RuntimeException("Groq API error " + response.statusCode() + ": " + errorBody)
                            );
                        })
                )
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(45))
                .block();
            
            if (responseJson == null || responseJson.isEmpty()) {
                throw new RuntimeException("Empty response from Groq API");
            }
            
            log.debug("Received response from Groq API, length: {} chars", responseJson.length());
            
            return parseResponse(responseJson);
            
        } catch (WebClientResponseException e) {
            log.error("Groq API HTTP error [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to call Groq API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Error calling Groq API", e);
            throw new RuntimeException("Failed to call Groq API: " + e.getMessage(), e);
        }
    }
    
    private Map<String, Object> buildRequestBody(List<Message> messages, List<ToolDefinition> tools) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        
        // Clean and validate messages
        List<Map<String, Object>> messageList = messages.stream()
            .map(Message::toMap)
            .map(this::cleanMessageMap)
            .filter(map -> map.containsKey("role") && map.containsKey("content"))
            .collect(Collectors.toList());
        
        if (messageList.isEmpty()) {
            throw new IllegalArgumentException("No valid messages to send to Groq API");
        }
        
        body.put("messages", messageList);
        
        if (tools != null && !tools.isEmpty()) {
            body.put("tools", tools.stream()
                .map(this::toolToMap)
                .collect(Collectors.toList()));
            body.put("tool_choice", "auto");
        }
        
        return body;
    }
    
    private Map<String, Object> cleanMessageMap(Map<String, Object> messageMap) {
        Map<String, Object> cleaned = new HashMap<>();
        
        // Always include role
        if (messageMap.containsKey("role")) {
            cleaned.put("role", messageMap.get("role"));
        }
        
        // Include content if present and not empty
        Object content = messageMap.get("content");
        if (content != null && !content.toString().trim().isEmpty()) {
            cleaned.put("content", content);
        }
        
        // Include tool_call_id for tool messages
        if (messageMap.containsKey("tool_call_id") && messageMap.get("tool_call_id") != null) {
            cleaned.put("tool_call_id", messageMap.get("tool_call_id"));
        }
        
        // Include name for tool messages
        if (messageMap.containsKey("name") && messageMap.get("name") != null) {
            cleaned.put("name", messageMap.get("name"));
        }
        
        return cleaned;
    }
    
    private Map<String, Object> toolToMap(ToolDefinition tool) {
        Map<String, Object> toolMap = new HashMap<>();
        toolMap.put("type", "function");
        
        Map<String, Object> function = new HashMap<>();
        function.put("name", tool.getName());
        function.put("description", tool.getDescription());
        function.put("parameters", tool.getParametersSchema());
        
        toolMap.put("function", function);
        return toolMap;
    }
    
    private GroqResponse parseResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            
            // Validate response structure
            if (!root.has("choices") || !root.get("choices").isArray() || root.get("choices").size() == 0) {
                log.error("Invalid Groq response structure: {}", json);
                throw new RuntimeException("Invalid response from Groq API: missing choices");
            }
            
            JsonNode choice = root.path("choices").path(0);
            JsonNode message = choice.path("message");
            
            if (!message.has("role")) {
                log.error("Invalid message structure in Groq response");
                throw new RuntimeException("Invalid message structure from Groq API");
            }
            
            GroqResponse response = new GroqResponse();
            
            // Check for tool calls
            JsonNode toolCalls = message.path("tool_calls");
            if (toolCalls.isArray() && toolCalls.size() > 0) {
                JsonNode toolCall = toolCalls.get(0);
                JsonNode function = toolCall.path("function");
                
                String name = function.path("name").asText();
                String argumentsJson = function.path("arguments").asText();
                String toolId = toolCall.path("id").asText();
                
                log.info("Tool call detected: {} (ID: {})", name, toolId);
                
                if (argumentsJson == null || argumentsJson.isEmpty()) {
                    log.warn("Empty arguments for tool call, using empty map");
                    response.setToolCall(name, new HashMap<>(), toolId);
                } else {
                    try {
                        Map<String, Object> arguments = objectMapper.readValue(
                            argumentsJson, 
                            objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class)
                        );
                        response.setToolCall(name, arguments, toolId);
                    } catch (JsonProcessingException e) {
                        log.error("Failed to parse tool arguments: {}", argumentsJson, e);
                        throw new RuntimeException("Invalid tool arguments from Groq API", e);
                    }
                }
            } else {
                // Regular text response
                String content = message.path("content").asText("");
                if (content.isEmpty()) {
                    log.warn("Empty content in text response");
                    content = "No response content";
                }
                response.setContent(content);
                log.info("Text response received, length: {} chars", content.length());
            }
            
            return response;
            
        } catch (JsonProcessingException e) {
            log.error("Failed to parse Groq response JSON: {}", json, e);
            throw new RuntimeException("Failed to parse Groq API response", e);
        }
    }
}
