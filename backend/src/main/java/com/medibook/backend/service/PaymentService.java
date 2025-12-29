package com.medibook.backend.service;

import com.medibook.backend.model.Appointment;
import com.medibook.backend.model.PaymentStatus;
import com.medibook.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment processPayment(Long appointmentId) {
        // Mock payment processing
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (Math.random() > 0.1) { // 90% success rate
            appointment.setPaymentStatus(PaymentStatus.PAID);
        } else {
            appointment.setPaymentStatus(PaymentStatus.FAILED);
        }

        return appointmentRepository.save(appointment);
    }
}
