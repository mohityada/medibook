package com.medibook.backend.model;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    private LocalTime startTime;
    private LocalTime endTime;
    
    private Boolean isActive = true;

    public Schedule() {
    }

    public Schedule(Long id, Doctor doctor, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, Boolean isActive) {
        this.id = id;
        this.doctor = doctor;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isActive = isActive;
    }

    public static class ScheduleBuilder {
        private Long id;
        private Doctor doctor;
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean isActive = true;

        public ScheduleBuilder id(Long id) { this.id = id; return this; }
        public ScheduleBuilder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public ScheduleBuilder dayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; return this; }
        public ScheduleBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public ScheduleBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public ScheduleBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Schedule build() {
            return new Schedule(id, doctor, dayOfWeek, startTime, endTime, isActive);
        }
    }

    public static ScheduleBuilder builder() {
        return new ScheduleBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
