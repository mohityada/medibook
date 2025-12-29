package com.medibook.backend.controller;

import com.medibook.backend.model.Appointment;
import com.medibook.backend.payload.request.AppointmentRequest;
import com.medibook.backend.security.services.UserDetailsImpl;
import com.medibook.backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public Appointment bookAppointment(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                       @RequestBody AppointmentRequest request) {
        return appointmentService.bookAppointment(userDetails.getId(), request);
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public List<Appointment> getMyAppointments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isDoctor = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));

        if (isDoctor) {
            return appointmentService.getAppointmentsByDoctorUser(userDetails.getId());
        }
        return appointmentService.getAppointmentsByPatient(userDetails.getId());
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public List<Appointment> getDoctorAppointments(@PathVariable Long doctorId) {
        return appointmentService.getAppointmentsByDoctor(doctorId);
    }
}
