package com.medibook.backend.repository;

import com.medibook.backend.model.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    List<MedicalHistory> findByPatient_Id(Long patientId);
    List<MedicalHistory> findByDoctor_Id(Long doctorId);
}
