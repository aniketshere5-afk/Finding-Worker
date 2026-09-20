package com.findingworker.service;

import com.findingworker.entity.User;
import com.findingworker.enums.Role;
import com.findingworker.exception.BadRequestException;
import com.findingworker.exception.ResourceNotFoundException;
import com.findingworker.repository.UserRepo;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepo userRepo;

    private User getLoggedInUser(Authentication authentication){
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        return userRepo.findByEmail(email)
                .orElseThrow(()-> new ResourceNotFoundException("Logged-in user not found"));
    }

    public UserService(UserRepo userRepo){
        this.userRepo = userRepo;
    }

    public User updateUser(User user, Authentication authentication){
        User loggedInUser = getLoggedInUser(authentication);

        if(!loggedInUser.getId().equals(user.getId())){
            if(loggedInUser.getRole() != Role.ADMIN){
                throw new BadRequestException("You can only update your profile !");
            }
        }
        User existingUser = userRepo.findByEmail(user.getEmail())
                .orElseThrow(()-> new ResourceNotFoundException("User not found"));

        existingUser.setName(user.getName());
        existingUser.setPhone(user.getPhone());

        if(loggedInUser.getRole() == Role.ADMIN){
            existingUser.setRole(user.getRole());
        }

        return userRepo.save(existingUser);
    }

    public void deleteUser(Long id){
        userRepo.deleteById(id);
    }

    public User findUserById(Long id, Authentication authentication){
        User loggedInUser = getLoggedInUser(authentication);

        if(loggedInUser.getRole() != Role.ADMIN && !loggedInUser.getId().equals(id)){
            throw new BadRequestException("You can only access your own profile");
        }
        return userRepo.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("User Id not found!"));
    }

    public List<User> getUsersByRole(Role role){
        return userRepo.findByRole(role);
    }

    public User getUserByEmail(String email){
        return userRepo.findByEmail(email)
                .orElseThrow(()-> new ResourceNotFoundException("No user registered with this email :"+email+" !"));
    }

    public User createGoogleUser(String name, String email, String phone, Role role) {
        if(role == Role.ADMIN){
            throw new BadRequestException("Admin can't be selected during the registration !");
        }
        if (userRepo.existsByEmail(email)) {
            throw new BadRequestException("User already exists with this email!");
        }
        if (userRepo.existsByPhone(phone)) {
            throw new BadRequestException("Phone number already registered!");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole(role);
        user.setPassword(null);
        return userRepo.save(user);
    }

}
