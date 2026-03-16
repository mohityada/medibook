package com.medibook.backend.repository;

import com.medibook.backend.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctor_IdAndIsActiveTrue(Long doctorId);
    List<Schedule> findByDoctor_Id(Long doctorId);
    List<Schedule> findByDoctor_IdAndDayOfWeekAndIsActiveTrue(Long doctorId, DayOfWeek dayOfWeek);
}
