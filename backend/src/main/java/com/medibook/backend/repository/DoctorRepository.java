package com.medibook.backend.repository;

import com.medibook.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecialityContainingIgnoreCase(String speciality);
    List<Doctor> findByHospital_CityContainingIgnoreCase(String city);
    // Complex queries will be handled by Specification or custom query
}
