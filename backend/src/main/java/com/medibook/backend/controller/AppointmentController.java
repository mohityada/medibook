package com.medibook.backend.controller;

import com.medibook.backend.model.Appointment;
import com.medibook.backend.payload.request.AppointmentRequest;
import com.medibook.backend.payload.response.MessageResponse;
import com.medibook.backend.security.services.UserDetailsImpl;
import com.medibook.backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ResponseEntity<Appointment> cancelAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, userDetails.getId(), reason));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> rescheduleAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> body) {
        LocalDateTime newTimeSlot = LocalDateTime.parse(body.get("timeSlot"));
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, userDetails.getId(), newTimeSlot));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Appointment> confirmAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(id, userDetails.getId()));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Appointment> completeAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(appointmentService.completeAppointment(id, userDetails.getId()));
    }
}
