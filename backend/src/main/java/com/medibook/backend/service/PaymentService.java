package com.medibook.backend.service;

import com.medibook.backend.model.Appointment;
import com.medibook.backend.model.AppointmentStatus;
import com.medibook.backend.model.PaymentStatus;
import com.medibook.backend.repository.AppointmentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.currency}")
    private String currency;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public boolean isStripeConfigured() {
        return stripeSecretKey != null && !stripeSecretKey.contains("placeholder");
    }

    @Transactional
    public Map<String, Object> createPaymentIntent(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Appointment is already paid");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot pay for a cancelled appointment");
        }

        Double fees = appointment.getDoctor().getFees();
        if (fees == null || fees <= 0) {
            throw new RuntimeException("Doctor has not set consultation fees");
        }

        Map<String, Object> result = new HashMap<>();

        if (isStripeConfigured()) {
            try {
                long amountInCents = Math.round(fees * 100);

                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                        .setAmount(amountInCents)
                        .setCurrency(currency)
                        .putMetadata("appointmentId", appointmentId.toString())
                        .putMetadata("doctorName", appointment.getDoctor().getUser().getFirstName() + " " + appointment.getDoctor().getUser().getLastName())
                        .putMetadata("patientName", appointment.getPatient().getUser().getFirstName() + " " + appointment.getPatient().getUser().getLastName())
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .build();

                PaymentIntent intent = PaymentIntent.create(params);
                appointment.setStripePaymentIntentId(intent.getId());
                appointmentRepository.save(appointment);

                result.put("clientSecret", intent.getClientSecret());
                result.put("paymentIntentId", intent.getId());
                result.put("amount", fees);
                result.put("mode", "stripe");
            } catch (StripeException e) {
                throw new RuntimeException("Stripe error: " + e.getMessage());
            }
        } else {
            // Demo mode - simulate payment without Stripe
            result.put("amount", fees);
            result.put("mode", "demo");
            result.put("appointmentId", appointmentId);
        }

        return result;
    }

    @Transactional
    public Appointment confirmPayment(Long appointmentId, String paymentIntentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (isStripeConfigured() && paymentIntentId != null) {
            try {
                PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
                if ("succeeded".equals(intent.getStatus())) {
                    appointment.setPaymentStatus(PaymentStatus.PAID);
                    appointment.setStripePaymentIntentId(paymentIntentId);
                } else {
                    appointment.setPaymentStatus(PaymentStatus.FAILED);
                }
            } catch (StripeException e) {
                appointment.setPaymentStatus(PaymentStatus.FAILED);
            }
        } else {
            // Demo mode - always succeed
            appointment.setPaymentStatus(PaymentStatus.PAID);
        }

        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment processRefund(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getPaymentStatus() != PaymentStatus.PAID) {
            throw new RuntimeException("Can only refund paid appointments");
        }

        if (isStripeConfigured() && appointment.getStripePaymentIntentId() != null) {
            try {
                RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(appointment.getStripePaymentIntentId())
                        .build();
                Refund.create(params);
            } catch (StripeException e) {
                throw new RuntimeException("Refund failed: " + e.getMessage());
            }
        }

        appointment.setPaymentStatus(PaymentStatus.REFUNDED);
        return appointmentRepository.save(appointment);
    }

    // Legacy method for backward compatibility
    public Appointment processPayment(Long appointmentId) {
        return confirmPayment(appointmentId, null);
    }
}
