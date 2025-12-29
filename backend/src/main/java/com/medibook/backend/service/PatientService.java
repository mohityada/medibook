package com.medibook.backend.service;

import com.medibook.backend.model.Patient;
import com.medibook.backend.model.User;
import com.medibook.backend.repository.PatientRepository;
import com.medibook.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PatientService {
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<Patient> getPatientByUserId(Long userId) {
        return patientRepository.findByUser_Id(userId);
    }

    @Transactional
    public Patient createOrUpdatePatient(Long userId, Patient patientDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientRepository.findByUser_Id(userId)
                .orElse(Patient.builder().user(user).build());

        patient.setDateOfBirth(patientDetails.getDateOfBirth());
        patient.setBloodGroup(patientDetails.getBloodGroup());
        patient.setGender(patientDetails.getGender());
        patient.setAllergies(patientDetails.getAllergies());

        return patientRepository.save(patient);
    }
}
