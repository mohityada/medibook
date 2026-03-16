package com.medibook.backend.service;

import com.medibook.backend.model.Doctor;
import com.medibook.backend.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;

    // Specialty normalization mapping
    private static final Map<String, List<String>> SPECIALTY_VARIATIONS = new HashMap<>() {{
        put("cardiology", Arrays.asList("cardiology", "cardiologist", "heart", "cardiac"));
        put("dermatology", Arrays.asList("dermatology", "dermatologist", "skin"));
        put("neurology", Arrays.asList("neurology", "neurologist", "brain", "neuro"));
        put("orthopedics", Arrays.asList("orthopedics", "orthopedic", "orthopaedic", "bone", "ortho"));
        put("pediatrics", Arrays.asList("pediatrics", "pediatric", "paediatric", "child", "kids"));
        put("psychiatry", Arrays.asList("psychiatry", "psychiatrist", "mental health", "psych"));
        put("gynecology", Arrays.asList("gynecology", "gynecologist", "gynaecology", "women", "obstetrics", "obgyn"));
        put("dentistry", Arrays.asList("dentistry", "dentist", "dental", "teeth"));
        put("ophthalmology", Arrays.asList("ophthalmology", "ophthalmologist", "eye", "vision"));
        put("ent", Arrays.asList("ent", "ear nose throat", "otolaryngology"));
        put("surgery", Arrays.asList("surgery", "surgeon", "surgical"));
    }};

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public List<Doctor> searchDoctors(String query) {
        Set<Doctor> allResults = new HashSet<>();
        
        // Search with original query
        allResults.addAll(doctorRepository.searchDoctorsByQuery(query));
        
        // Search with specialty variations
        String lowerQuery = query.toLowerCase().trim();
        for (Map.Entry<String, List<String>> entry : SPECIALTY_VARIATIONS.entrySet()) {
            if (entry.getValue().stream().anyMatch(variation -> 
                lowerQuery.contains(variation) || variation.contains(lowerQuery))) {
                // Search with the base specialty
                allResults.addAll(doctorRepository.searchDoctorsByQuery(entry.getKey()));
                // Search with all variations
                for (String variation : entry.getValue()) {
                    allResults.addAll(doctorRepository.searchDoctorsByQuery(variation));
                }
            }
        }
        
        return new ArrayList<>(allResults);
    }

    public Optional<Doctor> getDoctorByUserId(Long userId) {
        return doctorRepository.findByUser_Id(userId);
    }

    public Doctor updateFees(Long userId, Double fees) {
        Doctor doctor = doctorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        doctor.setFees(fees);
        return doctorRepository.save(doctor);
    }
}
