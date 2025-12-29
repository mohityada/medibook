package com.medibook.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String speciality;
    private String degree;
    private Integer experience; // In years
    private Double fees;
    private Boolean isFreelance;

    @ManyToOne
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    public Doctor() {
    }

    public Doctor(Long id, User user, String speciality, String degree, Integer experience, Double fees, Boolean isFreelance, Hospital hospital) {
        this.id = id;
        this.user = user;
        this.speciality = speciality;
        this.degree = degree;
        this.experience = experience;
        this.fees = fees;
        this.isFreelance = isFreelance;
        this.hospital = hospital;
    }

    // Manual Builder
    public static class DoctorBuilder {
        private Long id;
        private User user;
        private String speciality;
        private String degree;
        private Integer experience;
        private Double fees;
        private Boolean isFreelance;
        private Hospital hospital;

        public DoctorBuilder id(Long id) { this.id = id; return this; }
        public DoctorBuilder user(User user) { this.user = user; return this; }
        public DoctorBuilder speciality(String speciality) { this.speciality = speciality; return this; }
        public DoctorBuilder degree(String degree) { this.degree = degree; return this; }
        public DoctorBuilder experience(Integer experience) { this.experience = experience; return this; }
        public DoctorBuilder fees(Double fees) { this.fees = fees; return this; }
        public DoctorBuilder isFreelance(Boolean isFreelance) { this.isFreelance = isFreelance; return this; }
        public DoctorBuilder hospital(Hospital hospital) { this.hospital = hospital; return this; }

        public Doctor build() {
            return new Doctor(id, user, speciality, degree, experience, fees, isFreelance, hospital);
        }
    }

    public static DoctorBuilder builder() {
        return new DoctorBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSpeciality() { return speciality; }
    public void setSpeciality(String speciality) { this.speciality = speciality; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public Double getFees() { return fees; }
    public void setFees(Double fees) { this.fees = fees; }

    public Boolean getIsFreelance() { return isFreelance; }
    public void setIsFreelance(Boolean isFreelance) { this.isFreelance = isFreelance; }

    public Hospital getHospital() { return hospital; }
    public void setHospital(Hospital hospital) { this.hospital = hospital; }
}
