package com.app.gestion.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiConfiguration {
    
    private Groq groq = new Groq();
    private Orchestrator orchestrator = new Orchestrator();
    private Security security = new Security();
    
    @Data
    public static class Groq {
        private String apiKey;
        private String model = "llama-3.3-70b-versatile";
        private Integer timeout = 30;
        private Integer maxRetries = 3;
    }
    
    @Data
    public static class Orchestrator {
        private Integer maxIterations = 5;
        private Boolean logToolCalls = true;
        private Boolean strictPermissions = true;
    }
    
    @Data
    public static class Security {
        private Boolean allowDangerousTools = false;
        private Boolean requireAuthentication = true;
    }
}
