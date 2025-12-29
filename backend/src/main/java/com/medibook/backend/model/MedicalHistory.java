package com.medibook.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "medical_history")
public class MedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private String diagnosis;
    
    @Column(columnDefinition = "TEXT")
    private String prescription;
    
    @Column(columnDefinition = "TEXT")
    private String comments;

    private LocalDate visitDate;

    @Column(columnDefinition = "TEXT")
    private String vitalsJson; 

    public MedicalHistory() {
    }

    public MedicalHistory(Long id, Patient patient, Doctor doctor, String diagnosis, String prescription, String comments, LocalDate visitDate, String vitalsJson) {
        this.id = id;
        this.patient = patient;
        this.doctor = doctor;
        this.diagnosis = diagnosis;
        this.prescription = prescription;
        this.comments = comments;
        this.visitDate = visitDate;
        this.vitalsJson = vitalsJson;
    }

    public static class MedicalHistoryBuilder {
        private Long id;
        private Patient patient;
        private Doctor doctor;
        private String diagnosis;
        private String prescription;
        private String comments;
        private LocalDate visitDate;
        private String vitalsJson;

        public MedicalHistoryBuilder id(Long id) { this.id = id; return this; }
        public MedicalHistoryBuilder patient(Patient patient) { this.patient = patient; return this; }
        public MedicalHistoryBuilder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public MedicalHistoryBuilder diagnosis(String diagnosis) { this.diagnosis = diagnosis; return this; }
        public MedicalHistoryBuilder prescription(String prescription) { this.prescription = prescription; return this; }
        public MedicalHistoryBuilder comments(String comments) { this.comments = comments; return this; }
        public MedicalHistoryBuilder visitDate(LocalDate visitDate) { this.visitDate = visitDate; return this; }
        public MedicalHistoryBuilder vitalsJson(String vitalsJson) { this.vitalsJson = vitalsJson; return this; }

        public MedicalHistory build() {
            return new MedicalHistory(id, patient, doctor, diagnosis, prescription, comments, visitDate, vitalsJson);
        }
    }

    public static MedicalHistoryBuilder builder() {
        return new MedicalHistoryBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }

    public String getVitalsJson() { return vitalsJson; }
    public void setVitalsJson(String vitalsJson) { this.vitalsJson = vitalsJson; }
}
