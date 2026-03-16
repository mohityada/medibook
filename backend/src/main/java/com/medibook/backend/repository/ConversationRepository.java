package com.medibook.backend.repository;

import com.medibook.backend.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("SELECT c FROM Conversation c WHERE c.patient.user.id = :userId OR c.doctor.user.id = :userId ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findByUserIdOrderByLastMessageAtDesc(@Param("userId") Long userId);

    Optional<Conversation> findByPatient_IdAndDoctor_Id(Long patientId, Long doctorId);
}
