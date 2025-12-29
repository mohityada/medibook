package com.medibook.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private String contact;

    public Hospital() {
    }

    public Hospital(Long id, String name, String address, String city, String contact) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.city = city;
        this.contact = contact;
    }

    public static class HospitalBuilder {
        private Long id;
        private String name;
        private String address;
        private String city;
        private String contact;

        public HospitalBuilder id(Long id) { this.id = id; return this; }
        public HospitalBuilder name(String name) { this.name = name; return this; }
        public HospitalBuilder address(String address) { this.address = address; return this; }
        public HospitalBuilder city(String city) { this.city = city; return this; }
        public HospitalBuilder contact(String contact) { this.contact = contact; return this; }

        public Hospital build() {
            return new Hospital(id, name, address, city, contact);
        }
    }

    public static HospitalBuilder builder() {
        return new HospitalBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
}
