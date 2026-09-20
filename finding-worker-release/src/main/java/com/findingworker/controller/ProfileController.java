package com.findingworker.controller;

import com.findingworker.dto.CompleteProfileRequest;
import com.findingworker.entity.User;
import com.findingworker.exception.ResourceNotFoundException;
import com.findingworker.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public User me(Authentication authentication) {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        try {
            return userService.getUserByEmail(email);
        } catch (ResourceNotFoundException ex) {
            throw new ResourceNotFoundException("Profile not completed yet");
        }
    }

    @PostMapping("/complete")
    public User completeProfile(
            @Valid @RequestBody CompleteProfileRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = oauthToken.getPrincipal();

        String name = oauth2User.getAttribute("name");
        String email = oauth2User.getAttribute("email");

        User savedUser = userService.createGoogleUser(
                name,
                email,
                request.getPhone(),
                request.getRole()
        );

        // The session's Authentication was granted no role at initial login (the
        // user row didn't exist yet). Refresh it now so @PreAuthorize checks on
        // subsequent requests in this session see the newly assigned role.
        OidcUser oldOidcUser = (OidcUser) oauth2User;
        OidcUser refreshedOidcUser = new DefaultOidcUser(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + savedUser.getRole().name())),
                oldOidcUser.getIdToken(),
                oldOidcUser.getUserInfo(),
                "email"
        );
        OAuth2AuthenticationToken refreshedAuth = new OAuth2AuthenticationToken(
                refreshedOidcUser,
                refreshedOidcUser.getAuthorities(),
                oauthToken.getAuthorizedClientRegistrationId()
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(refreshedAuth);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return savedUser;
    }
}