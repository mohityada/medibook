package com.medibook.backend.repository;

import com.medibook.backend.model.Appointment;
import com.medibook.backend.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctor_Id(Long doctorId);
    List<Appointment> findByPatient_Id(Long patientId);
    List<Appointment> findByDoctor_IdAndTimeSlotAndStatusNot(Long doctorId, LocalDateTime timeSlot, AppointmentStatus status);
    long countByDoctor_IdAndStatus(Long doctorId, AppointmentStatus status);
    long countByPatient_IdAndStatus(Long patientId, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.status IN (:statuses) AND a.timeSlot BETWEEN :start AND :end")
    List<Appointment> findUpcomingAppointments(
            @Param("statuses") List<AppointmentStatus> statuses,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
