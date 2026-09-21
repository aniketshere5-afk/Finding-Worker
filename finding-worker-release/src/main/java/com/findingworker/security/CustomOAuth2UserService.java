package com.findingworker.security;

import com.findingworker.entity.User;
import com.findingworker.enums.Role;
import com.findingworker.repository.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomOAuth2UserService extends OidcUserService {

    private final UserRepo userRepo;
    private final Set<String> adminEmails;

    public CustomOAuth2UserService(UserRepo userRepo, @Value("${ADMIN_EMAILS:}") String adminEmailsCsv) {
        this.userRepo = userRepo;
        this.adminEmails = Arrays.stream(adminEmailsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest)
            throws OAuth2AuthenticationException {

        OidcUser oidcUser = super.loadUser(userRequest);

        String email = oidcUser.getAttribute("email");

        User user = userRepo.findByEmail(email).orElse(null);

        if (user == null) {
            return oidcUser;
        }

        // Auto-promote allowlisted emails that registered before ADMIN_EMAILS
        // existed, or whose role otherwise drifted from the allowlist.
        if (adminEmails.contains(email.toLowerCase()) && user.getRole() != Role.ADMIN) {
            user.setRole(Role.ADMIN);
            user = userRepo.save(user);
        }

        return new DefaultOidcUser(
                Collections.singleton(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        )
                ),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "email"
        );
    }
}