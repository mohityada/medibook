package com.medibook.backend.controller;

import com.medibook.backend.model.Review;
import com.medibook.backend.security.services.UserDetailsImpl;
import com.medibook.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Review> createReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> body) {
        Long appointmentId = Long.valueOf(body.get("appointmentId").toString());
        Integer rating = Integer.valueOf(body.get("rating").toString());
        String comment = body.get("comment") != null ? body.get("comment").toString() : null;
        Integer hospitalRating = body.get("hospitalRating") != null ? Integer.valueOf(body.get("hospitalRating").toString()) : null;
        String hospitalFeedback = body.get("hospitalFeedback") != null ? body.get("hospitalFeedback").toString() : null;

        Review review = reviewService.createReview(userDetails.getId(), appointmentId, rating, comment, hospitalRating, hospitalFeedback);
        return ResponseEntity.ok(review);
    }

    @PostMapping("/{reviewId}/respond")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Review> addDoctorResponse(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> body) {
        String response = body.get("response");
        Review review = reviewService.addDoctorResponse(reviewId, userDetails.getId(), response);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Review> getDoctorReviews(@PathVariable Long doctorId) {
        return reviewService.getDoctorReviews(doctorId);
    }

    @GetMapping("/doctor/{doctorId}/summary")
    public Map<String, Object> getDoctorRatingSummary(@PathVariable Long doctorId) {
        return reviewService.getDoctorRatingSummary(doctorId);
    }

    @GetMapping("/hospital/{hospitalId}")
    public List<Review> getHospitalReviews(@PathVariable Long hospitalId) {
        return reviewService.getHospitalReviews(hospitalId);
    }

    @GetMapping("/hospital/{hospitalId}/summary")
    public Map<String, Object> getHospitalRatingSummary(@PathVariable Long hospitalId) {
        return reviewService.getHospitalRatingSummary(hospitalId);
    }

    @GetMapping("/check/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public Map<String, Boolean> hasReviewed(@PathVariable Long appointmentId) {
        return Map.of("reviewed", reviewService.hasReviewed(appointmentId));
    }
}
