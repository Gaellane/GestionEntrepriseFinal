package com.app.gestion.ai.llm;

import java.util.Map;

import com.app.gestion.ai.tool.ToolCall;

import lombok.Data;

@Data
public class GroqResponse {
    private String content;
    private ToolCall toolCall;
    private String finishReason;

    public boolean isToolCall() {
        return toolCall != null;
    }

    public ToolCall getToolCall() {
        return toolCall;
    }

    public String getFinalAnswer() {
        return content;
    }
    
    public void setToolCall(String name, Map<String, Object> arguments, String id) {
        this.toolCall = new ToolCall(name, arguments, id);
    }
}
