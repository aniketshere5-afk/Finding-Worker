package com.findingworker.service;

import java.math.BigDecimal;
import java.util.List;

import com.findingworker.entity.User;
import com.findingworker.entity.WorkerProfile;
import com.findingworker.exception.BadRequestException;
import com.findingworker.exception.ResourceNotFoundException;
import com.findingworker.repository.UserRepo;
import com.findingworker.repository.WorkerProfileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.autoconfigure.WebMvcProperties;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.findingworker.specification.WorkerProfileSpecification;
import org.springframework.data.jpa.domain.Specification;



@Service
public class WorkerProfileService {

    private final WorkerProfileRepo workerProfileRepo;
    private final UserRepo userRepo;

    @Autowired
    public WorkerProfileService(WorkerProfileRepo workerProfileRepo, UserRepo userRepo) {
        this.workerProfileRepo = workerProfileRepo;
        this.userRepo = userRepo;
    }

    private User getLoggedInUser(Authentication authentication){
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        return userRepo.findByEmail(email)
                .orElseThrow(()-> new ResourceNotFoundException("Logged-in user not found"));
    }
    public List<WorkerProfile> findAllWorkerProfiles() {
        return workerProfileRepo.findAll();
    }

    public List<WorkerProfile> findWorkersByCity(String city) {
        return workerProfileRepo.findByCityIgnoreCase(city);
    }

    public List<WorkerProfile> findAvailableWorkers() {
        return workerProfileRepo.findByAvailableForWorkTrue();
    }

    public List<WorkerProfile> findVerifiedWorkers() {
        return workerProfileRepo.findByVerifiedTrue();
    }

    public List<WorkerProfile> findWorkersByCategory(String categoryName) {
        return workerProfileRepo.findByCategories_NameIgnoreCase(categoryName);
    }

    public List<WorkerProfile> searchWorkers(
            String city,
            String category,
            Boolean available,
            Boolean verified,
            Integer minExperience,
            Integer maxExperience,
            BigDecimal minHourlyRate,
            BigDecimal maxHourlyRate) {

        Specification<WorkerProfile> specification = null;

        if (city != null && !city.isBlank()) {
            specification = WorkerProfileSpecification.hasCity(city);
        }

        if (category != null && !category.isBlank()) {
            Specification<WorkerProfile> categorySpec =
                    WorkerProfileSpecification.hasCategory(category);

            specification = specification == null
                    ? categorySpec
                    : specification.and(categorySpec);
        }

        if (available != null) {
            Specification<WorkerProfile> availableSpec =
                    WorkerProfileSpecification.isAvailable(available);

            specification = specification == null
                    ? availableSpec
                    : specification.and(availableSpec);
        }

        if (verified != null) {
            Specification<WorkerProfile> verifiedSpec =
                    WorkerProfileSpecification.isVerified(verified);

            specification = specification == null
                    ? verifiedSpec
                    : specification.and(verifiedSpec);
        }

        if (minExperience != null) {
            Specification<WorkerProfile> minExpSpec =
                    WorkerProfileSpecification.hasMinimumExperience(minExperience);

            specification = specification == null
                    ? minExpSpec
                    : specification.and(minExpSpec);
        }

        if (maxExperience != null) {
            Specification<WorkerProfile> maxExpSpec =
                    WorkerProfileSpecification.hasMaximumExperience(maxExperience);

            specification = specification == null
                    ? maxExpSpec
                    : specification.and(maxExpSpec);
        }

        if (minHourlyRate != null) {
            Specification<WorkerProfile> minRateSpec =
                    WorkerProfileSpecification.hasMinimumHourlyRate(minHourlyRate);

            specification = specification == null
                    ? minRateSpec
                    : specification.and(minRateSpec);
        }

        if (maxHourlyRate != null) {
            Specification<WorkerProfile> maxRateSpec =
                    WorkerProfileSpecification.hasMaximumHourlyRate(maxHourlyRate);

            specification = specification == null
                    ? maxRateSpec
                    : specification.and(maxRateSpec);
        }

        return specification == null
                ? workerProfileRepo.findAll()
                : workerProfileRepo.findAll(specification);
    }

    public WorkerProfile createWorkerProfile(WorkerProfile workerProfile) {
        if(workerProfile == null){
            throw new BadRequestException("User is required");
        }

        if(workerProfileRepo.existsByUserId(workerProfile.getUser().getId())){
            throw new BadRequestException("Worker Profile already exists !");
        }
        return workerProfileRepo.save(workerProfile);
    }

    public WorkerProfile updateWorkerProfile(
            WorkerProfile workerProfile,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        WorkerProfile existingProfile =
                workerProfileRepo.findById(workerProfile.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Worker Profile not found!"));

        if (!existingProfile.getUser().getId().equals(user.getId())) {
            throw new BadRequestException(
                    "You can only update your own worker profile!");
        }

        existingProfile.setCategories(workerProfile.getCategories());
        existingProfile.setExperience(workerProfile.getExperience());
        existingProfile.setHourlyRate(workerProfile.getHourlyRate());
        existingProfile.setDescription(workerProfile.getDescription());
        existingProfile.setCity(workerProfile.getCity());
        existingProfile.setState(workerProfile.getState());
        existingProfile.setPincode(workerProfile.getPincode());
        existingProfile.setAvailableForWork(workerProfile.isAvailableForWork());

        return workerProfileRepo.save(existingProfile);
    }

    public void deleteWorkerProfile(
            Long id,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        WorkerProfile profile =
                workerProfileRepo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Worker Profile not found!"));

        if (!profile.getUser().getId().equals(user.getId())) {
            throw new BadRequestException(
                    "You can only delete your own worker profile!");
        }

        workerProfileRepo.delete(profile);
    }
    
    public WorkerProfile findWorkerProfileById(Long id) {
        return workerProfileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker Profile not found!"));
    }
}