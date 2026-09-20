package com.findingworker.repository;

import java.util.List;
import java.util.Optional;

import com.findingworker.entity.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface WorkerProfileRepo extends JpaRepository<WorkerProfile, Long>,
        JpaSpecificationExecutor<WorkerProfile> {
    List<WorkerProfile> findByCityIgnoreCase(String city);
    List<WorkerProfile> findByAvailableForWorkTrue();
    List<WorkerProfile> findByVerifiedTrue();
    List<WorkerProfile> findByCategories_NameIgnoreCase(String name);
    Optional<WorkerProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
