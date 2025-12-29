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

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .mobileNumber(signUpRequest.getMobileNumber())
                .role(Role.PATIENT) // Default role
                .build();

        Set<String> strRoles = signUpRequest.getRole();
        if (strRoles != null && strRoles.contains("doctor")) {
            user.setRole(Role.DOCTOR);
        } else if (strRoles != null && strRoles.contains("admin")) {
            user.setRole(Role.ADMIN);
        }

        User savedUser = userRepository.save(user);

        // Create profile based on role
        if (user.getRole() == Role.DOCTOR) {
            com.medibook.backend.model.Doctor doctor = com.medibook.backend.model.Doctor.builder()
                    .user(savedUser)
                    .build();
            doctorRepository.save(doctor);
        } else if (user.getRole() == Role.PATIENT) {
            com.medibook.backend.model.Patient patient = com.medibook.backend.model.Patient.builder()
                    .user(savedUser)
                    .build();
            patientRepository.save(patient);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
