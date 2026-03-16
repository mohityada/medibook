package com.medibook.backend.payload.request;

import java.time.LocalDateTime;

public class AppointmentRequest {
    private Long doctorId;
    private LocalDateTime timeSlot;
    private String notes;

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalDateTime getTimeSlot() { return timeSlot; }
    public void setTimeSlot(LocalDateTime timeSlot) { this.timeSlot = timeSlot; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
