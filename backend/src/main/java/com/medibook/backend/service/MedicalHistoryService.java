package com.medibook.backend.service;

import com.medibook.backend.model.MedicalHistory;
import com.medibook.backend.repository.MedicalHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalHistoryService {
    @Autowired
    private MedicalHistoryRepository medicalHistoryRepository;

    public List<MedicalHistory> getHistoryByPatientId(Long patientId) {
        return medicalHistoryRepository.findByPatient_Id(patientId);
    }

    public MedicalHistory addMedicalRecord(MedicalHistory history) {
        return medicalHistoryRepository.save(history);
    }
}
