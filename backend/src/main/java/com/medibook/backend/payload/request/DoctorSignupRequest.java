package com.medibook.backend.payload.request;

public class DoctorSignupRequest extends BaseSignupRequest {
    private String speciality;
    private String degree;
    private Integer experience;
    private Double fees;
    private Boolean isFreelance;

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
}
