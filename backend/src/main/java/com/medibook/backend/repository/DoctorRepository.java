package com.medibook.backend.repository;

import com.medibook.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecialityContainingIgnoreCase(String speciality);
    List<Doctor> findByHospital_CityContainingIgnoreCase(String city);
    java.util.Optional<Doctor> findByUser_Id(Long userId);

    @Query("SELECT DISTINCT d FROM Doctor d LEFT JOIN d.user u LEFT JOIN d.hospital h WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.speciality) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.degree) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Doctor> searchDoctorsByQuery(@Param("query") String query);
}
