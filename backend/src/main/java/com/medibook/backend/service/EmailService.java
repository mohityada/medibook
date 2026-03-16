package com.medibook.backend.service;

import com.medibook.backend.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@medibook.com}")
    private String fromEmail;

    @Value("${medibook.email.enabled:false}")
    private boolean emailEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            logger.info("[EMAIL DEMO] To: {} | Subject: {} | Body: {}", to, subject, body);
            return true;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Email sent to: {} | Subject: {}", to, subject);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send email to: {} | Error: {}", to, e.getMessage());
            return false;
        }
    }

    public void sendAppointmentReminder(User user, String doctorName, String dateTime, int hoursBeforeAppt) {
        String subject = String.format("MediBook: Appointment Reminder - %s hours", hoursBeforeAppt);
        String body = String.format(
                "Dear %s %s,\n\n" +
                "This is a reminder that you have an appointment with Dr. %s scheduled for %s.\n\n" +
                "Please make sure to arrive on time. If you need to reschedule or cancel, " +
                "please do so through your MediBook dashboard.\n\n" +
                "Best regards,\nMediBook Team",
                user.getFirstName(), user.getLastName(), doctorName, dateTime
        );
        sendEmail(user.getEmail(), subject, body);
    }

    public void sendCancellationNotice(User user, String otherPartyName, String dateTime, String reason) {
        String subject = "MediBook: Appointment Cancelled";
        String body = String.format(
                "Dear %s %s,\n\n" +
                "Your appointment with %s scheduled for %s has been cancelled.\n" +
                "%s\n" +
                "Please visit your MediBook dashboard to book a new appointment.\n\n" +
                "Best regards,\nMediBook Team",
                user.getFirstName(), user.getLastName(), otherPartyName, dateTime,
                reason != null ? "Reason: " + reason + "\n" : ""
        );
        sendEmail(user.getEmail(), subject, body);
    }

    public void sendAppointmentConfirmation(User user, String doctorName, String dateTime) {
        String subject = "MediBook: Appointment Confirmed";
        String body = String.format(
                "Dear %s %s,\n\n" +
                "Your appointment with Dr. %s on %s has been confirmed!\n\n" +
                "Please arrive on time. You can view your appointment details on your MediBook dashboard.\n\n" +
                "Best regards,\nMediBook Team",
                user.getFirstName(), user.getLastName(), doctorName, dateTime
        );
        sendEmail(user.getEmail(), subject, body);
    }
}
