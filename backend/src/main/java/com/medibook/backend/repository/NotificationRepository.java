package com.medibook.backend.repository;

import com.medibook.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    long countByUser_IdAndIsReadFalse(Long userId);
    boolean existsByAppointmentIdAndType(Long appointmentId, com.medibook.backend.model.NotificationType type);
}
