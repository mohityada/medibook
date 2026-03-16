package com.medibook.backend.service;

import com.medibook.backend.model.*;
import com.medibook.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Review createReview(Long userId, Long appointmentId, Integer rating, String comment,
                                Integer hospitalRating, String hospitalFeedback) {
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        if (hospitalRating != null && (hospitalRating < 1 || hospitalRating > 5)) {
            throw new RuntimeException("Hospital rating must be between 1 and 5");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Can only review completed appointments");
        }

        if (!appointment.getPatient().getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the patient can review this appointment");
        }

        if (reviewRepository.existsByAppointment_Id(appointmentId)) {
            throw new RuntimeException("Review already exists for this appointment");
        }

        Review review = new Review();
        review.setAppointment(appointment);
        review.setPatient(appointment.getPatient());
        review.setDoctor(appointment.getDoctor());
        review.setHospital(appointment.getDoctor().getHospital());
        review.setRating(rating);
        review.setComment(comment);
        review.setHospitalRating(hospitalRating);
        review.setHospitalFeedback(hospitalFeedback);
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);

        // Notify doctor about new review
        notificationService.createNotification(
                appointment.getDoctor().getUser(),
                NotificationType.NEW_REVIEW,
                "New Review Received",
                appointment.getPatient().getUser().getFirstName() + " left a " + rating + "-star review.",
                appointmentId
        );

        return saved;
    }

    @Transactional
    public Review addDoctorResponse(Long reviewId, Long userId, String response) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getDoctor().getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the reviewed doctor can respond");
        }

        review.setDoctorResponse(response);
        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public List<Review> getDoctorReviews(Long doctorId) {
        return reviewRepository.findByDoctor_IdOrderByCreatedAtDesc(doctorId);
    }

    public List<Review> getHospitalReviews(Long hospitalId) {
        return reviewRepository.findByHospital_IdOrderByCreatedAtDesc(hospitalId);
    }

    public Map<String, Object> getDoctorRatingSummary(Long doctorId) {
        Map<String, Object> summary = new HashMap<>();
        Double avgRating = reviewRepository.getAverageRatingByDoctorId(doctorId);
        Long count = reviewRepository.getReviewCountByDoctorId(doctorId);
        summary.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0);
        summary.put("totalReviews", count != null ? count : 0);
        return summary;
    }

    public Map<String, Object> getHospitalRatingSummary(Long hospitalId) {
        Map<String, Object> summary = new HashMap<>();
        Double avgRating = reviewRepository.getAverageHospitalRating(hospitalId);
        Long count = reviewRepository.getHospitalReviewCount(hospitalId);
        summary.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0);
        summary.put("totalReviews", count != null ? count : 0);
        return summary;
    }

    public boolean hasReviewed(Long appointmentId) {
        return reviewRepository.existsByAppointment_Id(appointmentId);
    }
}
