package com.medibook.backend.service;

import com.medibook.backend.model.*;
import com.medibook.backend.payload.request.AppointmentRequest;
import com.medibook.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MessageService messageService;

    @Transactional
    public Appointment bookAppointment(Long userId, AppointmentRequest request) {
        Patient patient = patientRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Patient profile not found for user"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check for conflicting appointments
        List<Appointment> conflicts = appointmentRepository
                .findByDoctor_IdAndTimeSlotAndStatusNot(doctor.getId(), request.getTimeSlot(), AppointmentStatus.CANCELLED);
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("This time slot is already booked");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .timeSlot(request.getTimeSlot())
                .status(AppointmentStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Send automated confirmation message
        String dateStr = request.getTimeSlot().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));
        messageService.sendSystemMessage(saved,
                "Appointment booked for " + dateStr + ". Status: PENDING. You will be notified once the doctor confirms.");

        return saved;
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctor_Id(doctorId);
    }

    public List<Appointment> getAppointmentsByPatient(Long userId) {
        Patient patient = patientRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        return appointmentRepository.findByPatient_Id(patient.getId());
    }

    public List<Appointment> getAppointmentsByDoctorUser(Long userId) {
        Doctor doctor = doctorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return appointmentRepository.findByDoctor_Id(doctor.getId());
    }

    @Transactional
    public Appointment cancelAppointment(Long appointmentId, Long userId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify ownership (patient or doctor can cancel)
        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(userId);
        if (!isPatient && !isDoctor) {
            throw new RuntimeException("Not authorized to cancel this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);

        // If payment was made, mark for refund
        if (appointment.getPaymentStatus() == PaymentStatus.PAID) {
            appointment.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        Appointment saved = appointmentRepository.save(appointment);
        notificationService.notifyAppointmentCancelled(saved, userId);
        messageService.sendSystemMessage(saved, "Appointment has been cancelled." + (reason != null ? " Reason: " + reason : ""));
        return saved;
    }

    @Transactional
    public Appointment rescheduleAppointment(Long appointmentId, Long userId, LocalDateTime newTimeSlot) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Only patient can reschedule
        if (!appointment.getPatient().getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to reschedule this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot reschedule a " + appointment.getStatus().name().toLowerCase() + " appointment");
        }

        // Check for conflicts at new time
        List<Appointment> conflicts = appointmentRepository
                .findByDoctor_IdAndTimeSlotAndStatusNot(appointment.getDoctor().getId(), newTimeSlot, AppointmentStatus.CANCELLED);
        conflicts.removeIf(a -> a.getId().equals(appointmentId));
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("The new time slot is already booked");
        }

        appointment.setTimeSlot(newTimeSlot);
        appointment.setStatus(AppointmentStatus.PENDING); // Reset to pending after reschedule
        Appointment saved = appointmentRepository.save(appointment);
        notificationService.notifyAppointmentRescheduled(saved);
        String dateStr = newTimeSlot.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));
        messageService.sendSystemMessage(saved, "Appointment rescheduled to " + dateStr + ". Status reset to PENDING.");
        return saved;
    }

    @Transactional
    public Appointment confirmAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Only doctor can confirm
        if (!appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the doctor can confirm this appointment");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Can only confirm pending appointments");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment saved = appointmentRepository.save(appointment);
        notificationService.notifyAppointmentConfirmed(saved);
        messageService.sendSystemMessage(saved, "Your appointment has been confirmed by the doctor. Please arrive on time.");
        return saved;
    }

    @Transactional
    public Appointment completeAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Only doctor can complete
        if (!appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the doctor can complete this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot complete a cancelled appointment");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        Appointment saved = appointmentRepository.save(appointment);
        notificationService.notifyAppointmentCompleted(saved);
        messageService.sendSystemMessage(saved, "Appointment completed. Thank you for visiting! Please leave a review to help other patients.");
        return saved;
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
}
