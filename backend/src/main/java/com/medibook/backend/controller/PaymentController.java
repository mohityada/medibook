package com.medibook.backend.controller;

import com.medibook.backend.model.Appointment;
import com.medibook.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> makePayment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(paymentService.processPayment(appointmentId));
    }
}
