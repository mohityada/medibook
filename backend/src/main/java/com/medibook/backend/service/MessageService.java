package com.medibook.backend.service;

import com.medibook.backend.model.*;
import com.medibook.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Conversation> getUserConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByLastMessageAtDesc(userId);
    }

    @Transactional
    public Conversation getOrCreateConversation(Long userId, Long doctorId) {
        Patient patient = patientRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return conversationRepository.findByPatient_IdAndDoctor_Id(patient.getId(), doctor.getId())
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setPatient(patient);
                    conv.setDoctor(doctor);
                    conv.setCreatedAt(LocalDateTime.now());
                    return conversationRepository.save(conv);
                });
    }

    public List<Message> getConversationMessages(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify user is part of conversation
        boolean isPatient = conversation.getPatient().getUser().getId().equals(userId);
        boolean isDoctor = conversation.getDoctor().getUser().getId().equals(userId);
        if (!isPatient && !isDoctor) {
            throw new RuntimeException("Not authorized to view this conversation");
        }

        return messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional
    public Message sendMessage(Long conversationId, Long userId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify user is part of conversation
        boolean isPatient = conversation.getPatient().getUser().getId().equals(userId);
        boolean isDoctor = conversation.getDoctor().getUser().getId().equals(userId);
        if (!isPatient && !isDoctor) {
            throw new RuntimeException("Not authorized to send messages in this conversation");
        }

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = new Message(conversation, sender, content, false);
        Message saved = messageRepository.save(message);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Notify the other party
        User recipient = isPatient ? conversation.getDoctor().getUser() : conversation.getPatient().getUser();
        notificationService.createNotification(
                recipient, NotificationType.NEW_MESSAGE,
                "New Message",
                sender.getFirstName() + " " + sender.getLastName() + ": " + (content.length() > 80 ? content.substring(0, 80) + "..." : content),
                null
        );

        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, saved);

        return saved;
    }

    @Transactional
    public void markConversationAsRead(Long conversationId, Long userId) {
        messageRepository.markConversationAsRead(conversationId, userId);
    }

    public long getUnreadCount(Long userId) {
        return messageRepository.countUnreadByUserId(userId);
    }

    /**
     * Send an automated system message (e.g., appointment confirmation).
     */
    @Transactional
    public void sendSystemMessage(Appointment appointment, String content) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        Conversation conversation = conversationRepository.findByPatient_IdAndDoctor_Id(patient.getId(), doctor.getId())
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setPatient(patient);
                    conv.setDoctor(doctor);
                    conv.setAppointment(appointment);
                    conv.setCreatedAt(LocalDateTime.now());
                    return conversationRepository.save(conv);
                });

        // System messages use the doctor's user as sender for display purposes
        Message message = new Message(conversation, doctor.getUser(), content, true);
        Message saved = messageRepository.save(message);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/conversations/" + conversation.getId(), saved);
    }
}
