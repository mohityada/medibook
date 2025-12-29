package com.medibook.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<?> home() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "running");
        status.put("service", "MediBook Backend");
        return ResponseEntity.ok(status);
    }
}
