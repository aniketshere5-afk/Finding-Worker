package com.findingworker.controller;

import com.findingworker.entity.User;
import com.findingworker.entity.WorkerProfile;
import com.findingworker.enums.Role;
import com.findingworker.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return adminService.getUserById(id);
    }

    @GetMapping("/users/by-role")
    public List<User> getUsersByRole(@RequestParam Role role) {
        return adminService.getUsersByRole(role);
    }

    @GetMapping("/workers")
    public List<WorkerProfile> getAllWorkers() {
        return adminService.getAllWorkers();
    }

    @PutMapping("/workers/{id}/verify")
    public WorkerProfile verifyWorker(@PathVariable Long id) {
        return adminService.verifyWorker(id);
    }
}
