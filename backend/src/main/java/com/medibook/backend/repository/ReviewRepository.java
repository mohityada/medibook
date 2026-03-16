package com.medibook.backend.repository;

import com.medibook.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByDoctor_IdOrderByCreatedAtDesc(Long doctorId);
    List<Review> findByHospital_IdOrderByCreatedAtDesc(Long hospitalId);
    List<Review> findByPatient_IdOrderByCreatedAtDesc(Long patientId);
    Optional<Review> findByAppointment_Id(Long appointmentId);
    boolean existsByAppointment_Id(Long appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double getAverageRatingByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.doctor.id = :doctorId")
    Long getReviewCountByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT AVG(r.hospitalRating) FROM Review r WHERE r.hospital.id = :hospitalId AND r.hospitalRating IS NOT NULL")
    Double getAverageHospitalRating(@Param("hospitalId") Long hospitalId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.hospital.id = :hospitalId AND r.hospitalRating IS NOT NULL")
    Long getHospitalReviewCount(@Param("hospitalId") Long hospitalId);
}
