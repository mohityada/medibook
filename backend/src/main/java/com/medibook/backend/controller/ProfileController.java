package com.medibook.backend.controller;

import com.medibook.backend.model.Role;
import com.medibook.backend.model.User;
import com.medibook.backend.payload.response.ProfileResponse;
import com.medibook.backend.repository.DoctorRepository;
import com.medibook.backend.repository.HospitalRepository;
import com.medibook.backend.repository.PatientRepository;
import com.medibook.backend.repository.UserRepository;
import com.medibook.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    HospitalRepository hospitalRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        Object details = null;

        if (user.getRole() == Role.PATIENT) {
            details = patientRepository.findByUser_Id(user.getId()).orElse(null);
        } else if (user.getRole() == Role.DOCTOR) {
            details = doctorRepository.findByUser_Id(user.getId()).orElse(null);
        } else if (user.getRole() == Role.HOSPITAL) {
            details = hospitalRepository.findByUser_Id(user.getId()).orElse(null);
        }

        return ResponseEntity.ok(new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getMobileNumber(),
                user.getRole().name(),
                details
        ));
    }
}
