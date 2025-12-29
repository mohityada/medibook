package com.medibook.backend.controller;

import com.medibook.backend.model.MedicalHistory;
import com.medibook.backend.service.MedicalHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/medical-history")
public class MedicalHistoryController {
    @Autowired
    private MedicalHistoryService medicalHistoryService;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or @userSecurity.isPatient(authentication, #patientId)")
    public List<MedicalHistory> getHistoryByPatient(@PathVariable Long patientId) {
        return medicalHistoryService.getHistoryByPatientId(patientId);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public MedicalHistory addRecord(@RequestBody MedicalHistory history) {
        return medicalHistoryService.addMedicalRecord(history);
    }
}
