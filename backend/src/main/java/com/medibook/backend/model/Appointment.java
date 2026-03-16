package com.medibook.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private LocalDateTime timeSlot;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    private String stripePaymentIntentId;

    public Appointment() {
    }

    public Appointment(Long id, Doctor doctor, Patient patient, LocalDateTime timeSlot, AppointmentStatus status, PaymentStatus paymentStatus, String notes, String cancellationReason, String stripePaymentIntentId) {
        this.id = id;
        this.doctor = doctor;
        this.patient = patient;
        this.timeSlot = timeSlot;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.notes = notes;
        this.cancellationReason = cancellationReason;
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public static class AppointmentBuilder {
        private Long id;
        private Doctor doctor;
        private Patient patient;
        private LocalDateTime timeSlot;
        private AppointmentStatus status;
        private PaymentStatus paymentStatus;
        private String notes;
        private String cancellationReason;
        private String stripePaymentIntentId;

        public AppointmentBuilder id(Long id) { this.id = id; return this; }
        public AppointmentBuilder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public AppointmentBuilder patient(Patient patient) { this.patient = patient; return this; }
        public AppointmentBuilder timeSlot(LocalDateTime timeSlot) { this.timeSlot = timeSlot; return this; }
        public AppointmentBuilder status(AppointmentStatus status) { this.status = status; return this; }
        public AppointmentBuilder paymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; return this; }
        public AppointmentBuilder notes(String notes) { this.notes = notes; return this; }
        public AppointmentBuilder cancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; return this; }
        public AppointmentBuilder stripePaymentIntentId(String stripePaymentIntentId) { this.stripePaymentIntentId = stripePaymentIntentId; return this; }

        public Appointment build() {
            return new Appointment(id, doctor, patient, timeSlot, status, paymentStatus, notes, cancellationReason, stripePaymentIntentId);
        }
    }

    public static AppointmentBuilder builder() {
        return new AppointmentBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public LocalDateTime getTimeSlot() { return timeSlot; }
    public void setTimeSlot(LocalDateTime timeSlot) { this.timeSlot = timeSlot; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String stripePaymentIntentId) { this.stripePaymentIntentId = stripePaymentIntentId; }
}

