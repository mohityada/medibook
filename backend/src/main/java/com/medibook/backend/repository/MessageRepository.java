package com.medibook.backend.repository;

import com.medibook.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversation_IdOrderByCreatedAtAsc(Long conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id IN " +
           "(SELECT c.id FROM Conversation c WHERE c.patient.user.id = :userId OR c.doctor.user.id = :userId) " +
           "AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id != :userId")
    void markConversationAsRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
