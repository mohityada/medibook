package com.medibook.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String gender;
    
    @Column(columnDefinition = "TEXT")
    private String allergies;

    public Patient() {
    }

    public Patient(Long id, User user, LocalDate dateOfBirth, String bloodGroup, String gender, String allergies) {
        this.id = id;
        this.user = user;
        this.dateOfBirth = dateOfBirth;
        this.bloodGroup = bloodGroup;
        this.gender = gender;
        this.allergies = allergies;
    }

    public static class PatientBuilder {
        private Long id;
        private User user;
        private LocalDate dateOfBirth;
        private String bloodGroup;
        private String gender;
        private String allergies;

        public PatientBuilder id(Long id) { this.id = id; return this; }
        public PatientBuilder user(User user) { this.user = user; return this; }
        public PatientBuilder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public PatientBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public PatientBuilder gender(String gender) { this.gender = gender; return this; }
        public PatientBuilder allergies(String allergies) { this.allergies = allergies; return this; }

        public Patient build() {
            return new Patient(id, user, dateOfBirth, bloodGroup, gender, allergies);
        }
    }

    public static PatientBuilder builder() {
        return new PatientBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }
}
