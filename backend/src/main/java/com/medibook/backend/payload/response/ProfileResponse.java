package com.medibook.backend.payload.response;

public class ProfileResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String role;
    private Object profileDetails;

    public ProfileResponse(Long id, String email, String firstName, String lastName, String mobileNumber, String role, Object profileDetails) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.mobileNumber = mobileNumber;
        this.role = role;
        this.profileDetails = profileDetails;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Object getProfileDetails() { return profileDetails; }
    public void setProfileDetails(Object profileDetails) { this.profileDetails = profileDetails; }
}
