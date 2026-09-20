package com.findingworker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;

@Entity
@Table(name = "worker_profiles")
@Getter
@Setter
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "worker_categories",
            joinColumns = @JoinColumn(name = "worker_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer experience;

    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @NotBlank
    @Column(length = 500)
    private String description;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotNull
    @Size(min = 6, max = 6)
    private String pincode;

    private boolean availableForWork;

    private boolean verified;

    @NotNull
    private Double trustScore = 0.0;
}
