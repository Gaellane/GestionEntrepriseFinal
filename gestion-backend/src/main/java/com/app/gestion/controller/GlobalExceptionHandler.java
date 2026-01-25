package com.app.gestion.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.app.gestion.dto.ApiResponse;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Value("${app.debug-exceptions:false}")
    private boolean debugExceptions;

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(IllegalArgumentException ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, ex.getMessage(), null);
        if (debugExceptions) {
            Map<String, Object> data = new HashMap<>();
            data.put("exception", ex.getClass().getName());
            data.put("stackTrace", getStackTrace(ex));
            body.setData(data);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(com.app.gestion.exception.InsufficientQuantityException.class)
    public ResponseEntity<ApiResponse<Object>> handleInsufficientQuantity(com.app.gestion.exception.InsufficientQuantityException ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, ex.getMessage(), null);
        if (debugExceptions) {
            Map<String, Object> data = new HashMap<>();
            data.put("exception", ex.getClass().getName());
            data.put("stackTrace", getStackTrace(ex));
            body.setData(data);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAll(Exception ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, ex.getMessage(), null);
        if (debugExceptions) {
            Map<String, Object> data = new HashMap<>();
            data.put("exception", ex.getClass().getName());
            data.put("stackTrace", getStackTrace(ex));
            body.setData(data);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private String getStackTrace(Exception ex) {
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement el : ex.getStackTrace()) {
            sb.append(el.toString()).append("\n");
        }
        return sb.toString();
    }
}
