package com.medibook.backend.controller;

import com.medibook.backend.model.Appointment;
import com.medibook.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @Value("${stripe.publishable-key}")
    private String stripePublishableKey;

    @PostMapping("/create-intent/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@PathVariable Long appointmentId) {
        Map<String, Object> result = paymentService.createPaymentIntent(appointmentId);
        result.put("publishableKey", stripePublishableKey);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/confirm/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> confirmPayment(
            @PathVariable Long appointmentId,
            @RequestBody(required = false) Map<String, String> body) {
        String paymentIntentId = body != null ? body.get("paymentIntentId") : null;
        return ResponseEntity.ok(paymentService.confirmPayment(appointmentId, paymentIntentId));
    }

    @PostMapping("/refund/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> processRefund(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(paymentService.processRefund(appointmentId));
    }

    // Legacy endpoint for backward compatibility
    @PostMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> makePayment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(paymentService.processPayment(appointmentId));
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getPaymentConfig() {
        return ResponseEntity.ok(Map.of(
                "publishableKey", stripePublishableKey,
                "stripeEnabled", paymentService.isStripeConfigured()
        ));
    }
}
