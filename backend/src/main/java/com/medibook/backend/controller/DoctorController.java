package com.medibook.backend.controller;

import com.medibook.backend.model.Doctor;
import com.medibook.backend.security.services.UserDetailsImpl;
import com.medibook.backend.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {
    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return doctorService.getDoctorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.saveDoctor(doctor);
    }

    @GetMapping("/search")
    public List<Doctor> searchDoctors(@RequestParam String query) {
        return doctorService.searchDoctors(query);
    }

    @PutMapping("/update-fees")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Doctor> updateFees(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Double> body) {
        Double fees = body.get("fees");
        if (fees == null || fees < 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(doctorService.updateFees(userDetails.getId(), fees));
    }

    @PutMapping("/update-profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Doctor> updateDoctorProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> body) {
        Doctor doctor = doctorService.getDoctorByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        if (body.containsKey("fees")) {
            doctor.setFees(((Number) body.get("fees")).doubleValue());
        }
        if (body.containsKey("speciality")) {
            doctor.setSpeciality((String) body.get("speciality"));
        }
        if (body.containsKey("experience")) {
            doctor.setExperience(((Number) body.get("experience")).intValue());
        }
        if (body.containsKey("degree")) {
            doctor.setDegree((String) body.get("degree"));
        }

        return ResponseEntity.ok(doctorService.saveDoctor(doctor));
    }

    @PutMapping("/update-status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Doctor> updateDoctorStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> body) {
        Doctor doctor = doctorService.getDoctorByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        if (body.containsKey("isFreelance")) {
            boolean isFreelance = (Boolean) body.get("isFreelance");
            doctor.setIsFreelance(isFreelance);
            
            // If changing to freelance, remove hospital assignment
            if (isFreelance) {
                doctor.setHospital(null);
            }
        }
        
        if (body.containsKey("hospitalId") && !doctor.getIsFreelance()) {
            Long hospitalId = ((Number) body.get("hospitalId")).longValue();
            if (hospitalId != null && hospitalId > 0) {
                // Note: You might want to add proper hospital fetching logic here
                // For now, this is a placeholder
                doctor.setIsFreelance(false);
            }
        }

        return ResponseEntity.ok(doctorService.saveDoctor(doctor));
    }
}
