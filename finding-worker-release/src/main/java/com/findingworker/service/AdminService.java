package com.findingworker.service;

import com.findingworker.entity.User;
import com.findingworker.entity.WorkerProfile;
import com.findingworker.enums.Role;
import com.findingworker.exception.ResourceNotFoundException;
import com.findingworker.repository.UserRepo;
import com.findingworker.repository.WorkerProfileRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    private final UserRepo userRepo;
    private final WorkerProfileRepo workerProfileRepo;

    public AdminService(UserRepo userRepo, WorkerProfileRepo workerProfileRepo){
        this.userRepo = userRepo;
        this.workerProfileRepo = workerProfileRepo;
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public User getUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User Id not found!"));
    }

    public List<User> getUsersByRole(Role role) {
        return userRepo.findByRole(role);
    }

    public List<WorkerProfile> getAllWorkers() {
        return workerProfileRepo.findAll();
    }

    public WorkerProfile verifyWorker(Long workerProfileId) {

        WorkerProfile workerProfile =
                workerProfileRepo.findById(workerProfileId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Worker Profile not found!"
                                ));

        workerProfile.setVerified(true);

        return workerProfileRepo.save(workerProfile);
    }
}

