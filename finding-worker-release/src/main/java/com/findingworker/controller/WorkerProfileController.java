package com.findingworker.controller;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

import com.findingworker.entity.User;
import com.findingworker.entity.WorkerProfile;
import com.findingworker.exception.ResourceNotFoundException;
import com.findingworker.repository.UserRepo;
import com.findingworker.service.WorkerProfileService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker-profiles")
public class WorkerProfileController {

    private final WorkerProfileService workerProfileService;
    private final UserRepo userRepo;

    public WorkerProfileController(WorkerProfileService workerProfileService, UserRepo userRepo) {
        this.workerProfileService = workerProfileService;
        this.userRepo = userRepo;
    }

    @GetMapping("/get-all-workers")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER')")
    public List<WorkerProfile> getAllWorkers() {
        return workerProfileService.findAllWorkerProfiles();
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER')")
    public List<WorkerProfile> getAvailableWorkers() {
        return workerProfileService.findAvailableWorkers();
    }

    @GetMapping("/verified")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER')")
    public List<WorkerProfile> getVerifiedWorkers() {
        return workerProfileService.findVerifiedWorkers();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER')")
    public List<WorkerProfile> searchWorkersByCity(@RequestParam String city) {
        return workerProfileService.findWorkersByCity(city);
    }

    @GetMapping("/search-workers")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER')")
    public List<WorkerProfile> searchWorkers(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(required = false) BigDecimal minHourlyRate,
            @RequestParam(required = false) BigDecimal maxHourlyRate) {

        return workerProfileService.searchWorkers(
                city,
                category,
                available,
                verified,
                minExperience,
                maxExperience,
                minHourlyRate,
                maxHourlyRate
        );
    }

    @GetMapping("/search-by-category")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER')")
    public List<WorkerProfile> searchWorkersByCategory(@RequestParam String name) {
        return workerProfileService.findWorkersByCategory(name);
    }

    @PostMapping("/create-worker-profile")
    @PreAuthorize("hasRole('WORKER')")
    public WorkerProfile createWorkerProfile(@Valid @RequestBody WorkerProfile workerProfile, Authentication authentication) {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");

        User user = userRepo.findByEmail(email)
                .orElseThrow(()->
                        new ResourceNotFoundException("Logged-in user not found !"));
        workerProfile.setUser(user);

        return workerProfileService.createWorkerProfile(workerProfile);
    }

    @GetMapping("/get-worker-profile-by-id/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER')")
    public WorkerProfile getWorkerProfileById(@PathVariable Long id) {
        return workerProfileService.findWorkerProfileById(id);
    }

    @PutMapping("/update-worker-profile")
    @PreAuthorize("hasRole('WORKER')")
    public WorkerProfile updateWorkerProfile(@Valid @RequestBody WorkerProfile workerProfile, Authentication authentication) {
        return workerProfileService.updateWorkerProfile(workerProfile, authentication);
    }

    @DeleteMapping("/delete-worker-profile-by-id/{id}")
    @PreAuthorize("hasRole('WORKER')")
    public void deleteWorkerProfileById(@PathVariable Long id, Authentication authentication) {
        workerProfileService.deleteWorkerProfile(id, authentication);
    }
}
