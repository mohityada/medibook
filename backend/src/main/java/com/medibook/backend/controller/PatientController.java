package com.medibook.backend.controller;

import com.medibook.backend.model.Patient;
import com.medibook.backend.security.services.UserDetailsImpl;
import com.medibook.backend.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/patients")
public class PatientController {
    @Autowired
    private PatientService patientService;

    @GetMapping("/me")
    public ResponseEntity<Patient> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return patientService.getPatientByUserId(userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Patient> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                 @RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.createOrUpdatePatient(userDetails.getId(), patient));
    }
}
