package com.medibook.backend.controller;

import com.medibook.backend.model.Doctor;
import com.medibook.backend.model.Schedule;
import com.medibook.backend.security.services.UserDetailsImpl;
import com.medibook.backend.service.DoctorService;
import com.medibook.backend.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private DoctorService doctorService;

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Schedule>> getDoctorSchedules(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDoctorId(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/available-slots")
    public ResponseEntity<List<Map<String, String>>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "7") int days) {
        
        List<Schedule> schedules = scheduleService.getSchedulesByDoctorId(doctorId);
        List<Map<String, String>> availableSlots = new ArrayList<>();
        
        LocalDate today = LocalDate.now();
        
        for (int i = 1; i <= days; i++) {
            LocalDate date = today.plusDays(i);
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            
            // Find schedules for this day
            for (Schedule schedule : schedules) {
                if (schedule.getDayOfWeek() == dayOfWeek && schedule.getIsActive()) {
                    // Generate hourly slots between start and end time
                    LocalTime currentTime = schedule.getStartTime();
                    LocalTime endTime = schedule.getEndTime();
                    
                    while (currentTime.isBefore(endTime)) {
                        LocalDateTime slotDateTime = LocalDateTime.of(date, currentTime);
                        
                        Map<String, String> slot = new HashMap<>();
                        slot.put("dateTime", slotDateTime.toString());
                        slot.put("date", date.toString());
                        slot.put("time", currentTime.toString());
                        slot.put("displayDate", date.format(DateTimeFormatter.ofPattern("EEE, MMM dd")));
                        slot.put("displayTime", currentTime.format(DateTimeFormatter.ofPattern("hh:mm a")));
                        
                        availableSlots.add(slot);
                        currentTime = currentTime.plusHours(1);
                    }
                }
            }
        }
        
        return ResponseEntity.ok(availableSlots);
    }

    @GetMapping("/my-schedules")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<Schedule>> getMySchedules(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Doctor doctor = doctorService.getDoctorByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return ResponseEntity.ok(scheduleService.getAllSchedulesByDoctorId(doctor.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Schedule> createSchedule(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> scheduleData) {
        Doctor doctor = doctorService.getDoctorByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        Schedule schedule = Schedule.builder()
                .doctor(doctor)
                .dayOfWeek(DayOfWeek.valueOf((String) scheduleData.get("dayOfWeek")))
                .startTime(LocalTime.parse((String) scheduleData.get("startTime")))
                .endTime(LocalTime.parse((String) scheduleData.get("endTime")))
                .isActive(true)
                .build();

        return ResponseEntity.ok(scheduleService.createSchedule(schedule));
    }

    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Schedule> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody Map<String, Object> scheduleData) {
        
        Schedule updatedSchedule = Schedule.builder()
                .dayOfWeek(DayOfWeek.valueOf((String) scheduleData.get("dayOfWeek")))
                .startTime(LocalTime.parse((String) scheduleData.get("startTime")))
                .endTime(LocalTime.parse((String) scheduleData.get("endTime")))
                .isActive((Boolean) scheduleData.getOrDefault("isActive", true))
                .build();

        return ResponseEntity.ok(scheduleService.updateSchedule(scheduleId, updatedSchedule));
    }

    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(Map.of("message", "Schedule deleted successfully"));
    }

    @PostMapping("/create-default")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<Schedule>> createDefaultSchedules(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Doctor doctor = doctorService.getDoctorByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        
        List<Schedule> schedules = scheduleService.createDefaultSchedules(doctor.getId());
        return ResponseEntity.ok(schedules);
    }
}
