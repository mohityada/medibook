package com.medibook.backend.service;

import com.medibook.backend.model.Doctor;
import com.medibook.backend.model.Schedule;
import com.medibook.backend.repository.DoctorRepository;
import com.medibook.backend.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public List<Schedule> getSchedulesByDoctorId(Long doctorId) {
        return scheduleRepository.findByDoctor_IdAndIsActiveTrue(doctorId);
    }

    public List<Schedule> getAllSchedulesByDoctorId(Long doctorId) {
        return scheduleRepository.findByDoctor_Id(doctorId);
    }

    public Schedule createSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    public Schedule updateSchedule(Long scheduleId, Schedule scheduleDetails) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        schedule.setDayOfWeek(scheduleDetails.getDayOfWeek());
        schedule.setStartTime(scheduleDetails.getStartTime());
        schedule.setEndTime(scheduleDetails.getEndTime());
        schedule.setIsActive(scheduleDetails.getIsActive());
        
        return scheduleRepository.save(schedule);
    }

    public void deleteSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.setIsActive(false);
        scheduleRepository.save(schedule);
    }

    @Transactional
    public List<Schedule> createDefaultSchedules(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<Schedule> defaultSchedules = new ArrayList<>();
        
        // Create default schedules for weekdays (Monday to Friday)
        // Morning: 9:00 AM - 12:00 PM
        // Evening: 2:00 PM - 6:00 PM
        DayOfWeek[] weekdays = {
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, 
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY
        };

        for (DayOfWeek day : weekdays) {
            // Morning shift
            Schedule morningSchedule = Schedule.builder()
                    .doctor(doctor)
                    .dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(12, 0))
                    .isActive(true)
                    .build();
            defaultSchedules.add(scheduleRepository.save(morningSchedule));

            // Evening shift
            Schedule eveningSchedule = Schedule.builder()
                    .doctor(doctor)
                    .dayOfWeek(day)
                    .startTime(LocalTime.of(14, 0))
                    .endTime(LocalTime.of(18, 0))
                    .isActive(true)
                    .build();
            defaultSchedules.add(scheduleRepository.save(eveningSchedule));
        }

        return defaultSchedules;
    }
}
