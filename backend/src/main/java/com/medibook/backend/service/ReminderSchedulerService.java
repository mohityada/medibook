package com.medibook.backend.service;

import com.medibook.backend.model.*;
import com.medibook.backend.repository.AppointmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReminderSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderSchedulerService.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    /**
     * Runs every hour to check for appointments needing 24h/48h reminders.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void sendAppointmentReminders() {
        logger.info("Running appointment reminder check...");
        LocalDateTime now = LocalDateTime.now();
        List<AppointmentStatus> activeStatuses = List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

        // 48-hour reminders: appointments between 47-49 hours from now
        sendRemindersForWindow(now.plusHours(47), now.plusHours(49), activeStatuses, 48, NotificationType.REMINDER_48H);

        // 24-hour reminders: appointments between 23-25 hours from now
        sendRemindersForWindow(now.plusHours(23), now.plusHours(25), activeStatuses, 24, NotificationType.REMINDER_24H);
    }

    private void sendRemindersForWindow(LocalDateTime start, LocalDateTime end,
                                         List<AppointmentStatus> statuses,
                                         int hoursBeforeAppt, NotificationType type) {
        List<Appointment> appointments = appointmentRepository.findUpcomingAppointments(statuses, start, end);

        for (Appointment apt : appointments) {
            if (notificationService.alreadyNotified(apt.getId(), type)) {
                continue;
            }

            User patient = apt.getPatient().getUser();
            String doctorName = apt.getDoctor().getUser().getFirstName() + " " + apt.getDoctor().getUser().getLastName();
            String dateTime = apt.getTimeSlot().format(FORMATTER);

            // Create in-app notification
            notificationService.createNotification(
                    patient, type,
                    "Appointment Reminder",
                    "Reminder: You have an appointment with Dr. " + doctorName + " on " + dateTime +
                    " (" + hoursBeforeAppt + " hours from now).",
                    apt.getId()
            );

            // Send email reminder
            emailService.sendAppointmentReminder(patient, doctorName, dateTime, hoursBeforeAppt);

            logger.info("Sent {}h reminder for appointment #{} to patient {}", hoursBeforeAppt, apt.getId(), patient.getEmail());
        }
    }
}
