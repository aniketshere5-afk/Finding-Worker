package com.findingworker.controller;

import jakarta.validation.Valid;
import com.findingworker.entity.User;
import com.findingworker.enums.Role;
import com.findingworker.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping("/get-user-by-id/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER','ADMIN')")
    public User getUserById(@PathVariable Long id, Authentication authentication){
        return userService.findUserById(id, authentication);
    }

    @PutMapping("/update-user")
    @PreAuthorize("hasAnyRole('CUSTOMER','WORKER','ADMIN')")
    public User updateUser(@Valid @RequestBody User user, Authentication authentication){
        return userService.updateUser(user, authentication);
    }

    @DeleteMapping("/delete-user-by-id/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUserById(@PathVariable Long id){
        userService.deleteUser(id);
    }

    @GetMapping("/get-users-by-role")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getUsersByRole(@RequestParam Role role) {
        return userService.getUsersByRole(role);
    }

    @GetMapping("/get-user-by-email")
    @PreAuthorize("hasRole('ADMIN')")
    public User getUserByEmail(@RequestParam String email){
        return userService.getUserByEmail(email);
    }

}
