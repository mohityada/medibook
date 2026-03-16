package com.medibook.backend.service;

import com.medibook.backend.model.*;
import com.medibook.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(User user, NotificationType type, String title, String message, Long appointmentId) {
        Notification notification = new Notification(user, type, title, message, appointmentId);
        Notification saved = notificationRepository.save(notification);
        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), saved);
        return saved;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_IdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    public boolean alreadyNotified(Long appointmentId, NotificationType type) {
        return notificationRepository.existsByAppointmentIdAndType(appointmentId, type);
    }

    // --- High-level notification helpers ---

    public void notifyAppointmentConfirmed(Appointment appointment) {
        User patient = appointment.getPatient().getUser();
        String doctorName = appointment.getDoctor().getUser().getFirstName() + " " + appointment.getDoctor().getUser().getLastName();
        String dateTime = appointment.getTimeSlot().toString();

        createNotification(patient, NotificationType.CONFIRMATION,
                "Appointment Confirmed",
                "Your appointment with Dr. " + doctorName + " on " + dateTime + " has been confirmed.",
                appointment.getId());

        emailService.sendAppointmentConfirmation(patient, doctorName, dateTime);
    }

    public void notifyAppointmentCancelled(Appointment appointment, Long cancelledByUserId) {
        User patient = appointment.getPatient().getUser();
        User doctor = appointment.getDoctor().getUser();
        String dateTime = appointment.getTimeSlot().toString();
        String reason = appointment.getCancellationReason();

        boolean cancelledByDoctor = doctor.getId().equals(cancelledByUserId);

        if (cancelledByDoctor) {
            String doctorName = doctor.getFirstName() + " " + doctor.getLastName();
            createNotification(patient, NotificationType.CANCELLATION,
                    "Appointment Cancelled by Doctor",
                    "Dr. " + doctorName + " has cancelled your appointment on " + dateTime +
                    (reason != null ? ". Reason: " + reason : "") + ". Please reschedule at your convenience.",
                    appointment.getId());
            emailService.sendCancellationNotice(patient, "Dr. " + doctorName, dateTime, reason);
        } else {
            String patientName = patient.getFirstName() + " " + patient.getLastName();
            createNotification(doctor, NotificationType.CANCELLATION,
                    "Appointment Cancelled by Patient",
                    patientName + " has cancelled the appointment on " + dateTime +
                    (reason != null ? ". Reason: " + reason : ""),
                    appointment.getId());
        }
    }

    public void notifyAppointmentRescheduled(Appointment appointment) {
        User doctor = appointment.getDoctor().getUser();
        String patientName = appointment.getPatient().getUser().getFirstName() + " " + appointment.getPatient().getUser().getLastName();
        String newDateTime = appointment.getTimeSlot().toString();

        createNotification(doctor, NotificationType.RESCHEDULE,
                "Appointment Rescheduled",
                patientName + " has rescheduled their appointment to " + newDateTime + ". Please review.",
                appointment.getId());
    }

    public void notifyAppointmentCompleted(Appointment appointment) {
        User patient = appointment.getPatient().getUser();
        String doctorName = appointment.getDoctor().getUser().getFirstName() + " " + appointment.getDoctor().getUser().getLastName();

        createNotification(patient, NotificationType.APPOINTMENT_COMPLETED,
                "Appointment Completed",
                "Your appointment with Dr. " + doctorName + " has been completed. Please leave a review to help other patients.",
                appointment.getId());
    }
}
