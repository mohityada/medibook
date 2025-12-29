package com.medibook.backend.repository;

import com.medibook.backend.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByCityContainingIgnoreCase(String city);
    List<Hospital> findByNameContainingIgnoreCase(String name);
}
