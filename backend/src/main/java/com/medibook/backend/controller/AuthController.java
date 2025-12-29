package com.medibook.backend.controller;

import com.medibook.backend.model.Role;
import com.medibook.backend.model.User;
import com.medibook.backend.payload.request.LoginRequest;
import com.medibook.backend.payload.request.SignupRequest;
import com.medibook.backend.payload.response.JwtResponse;
import com.medibook.backend.payload.response.MessageResponse;
import com.medibook.backend.repository.UserRepository;
import com.medibook.backend.security.jwt.JwtUtils;
import com.medibook.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                null, // mobile number not in userDetails yet, need to add if needed in response
                roles));
    }

    @Autowired
    com.medibook.backend.repository.PatientRepository patientRepository;

    @Autowired
    com.medibook.backend.repository.DoctorRepository doctorRepository;

    @Autowired
    com.medibook.backend.repository.HospitalRepository hospitalRepository;

    @PostMapping("/signup/patient")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody com.medibook.backend.payload.request.PatientSignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = User.builder()
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .mobileNumber(signUpRequest.getMobileNumber())
                .role(Role.PATIENT)
                .build();

        User savedUser = userRepository.save(user);

        java.time.LocalDate dob = null;
        if (signUpRequest.getDateOfBirth() != null && !signUpRequest.getDateOfBirth().isEmpty()) {
            dob = java.time.LocalDate.parse(signUpRequest.getDateOfBirth());
        }

        com.medibook.backend.model.Patient patient = com.medibook.backend.model.Patient.builder()
                .user(savedUser)
                .dateOfBirth(dob)
                .bloodGroup(signUpRequest.getBloodGroup())
                .gender(signUpRequest.getGender())
                .allergies(signUpRequest.getAllergies())
                .build();
        patientRepository.save(patient);

        return ResponseEntity.ok(new MessageResponse("Patient registered successfully!"));
    }

    @PostMapping("/signup/doctor")
    public ResponseEntity<?> registerDoctor(@Valid @RequestBody com.medibook.backend.payload.request.DoctorSignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = User.builder()
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .mobileNumber(signUpRequest.getMobileNumber())
                .role(Role.DOCTOR)
                .build();

        User savedUser = userRepository.save(user);

        com.medibook.backend.model.Doctor doctor = com.medibook.backend.model.Doctor.builder()
                .user(savedUser)
                .speciality(signUpRequest.getSpeciality())
                .degree(signUpRequest.getDegree())
                .experience(signUpRequest.getExperience())
                .fees(signUpRequest.getFees())
                .isFreelance(signUpRequest.getIsFreelance())
                .build();
        doctorRepository.save(doctor);

        return ResponseEntity.ok(new MessageResponse("Doctor registered successfully!"));
    }

    @PostMapping("/signup/hospital")
    public ResponseEntity<?> registerHospital(@Valid @RequestBody com.medibook.backend.payload.request.HospitalSignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = User.builder()
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .mobileNumber(signUpRequest.getMobileNumber())
                .role(Role.HOSPITAL)
                .build();

        User savedUser = userRepository.save(user);

        com.medibook.backend.model.Hospital hospital = com.medibook.backend.model.Hospital.builder()
                .user(savedUser)
                .name(signUpRequest.getHospitalName())
                .address(signUpRequest.getHospitalAddress())
                .city(signUpRequest.getHospitalCity())
                .contact(signUpRequest.getHospitalContact())
                .build();
        hospitalRepository.save(hospital);

        return ResponseEntity.ok(new MessageResponse("Hospital registered successfully!"));
    }
}
