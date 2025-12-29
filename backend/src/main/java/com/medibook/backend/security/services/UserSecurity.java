package com.medibook.backend.security.services;

import com.medibook.backend.model.Patient;
import com.medibook.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("userSecurity")
public class UserSecurity {
    @Autowired
    PatientRepository patientRepository;

    public boolean isPatient(Authentication authentication, Long patientId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return patientRepository.findByUser_Id(userDetails.getId())
                .map(patient -> patient.getId().equals(patientId))
                .orElse(false);
    }
}
