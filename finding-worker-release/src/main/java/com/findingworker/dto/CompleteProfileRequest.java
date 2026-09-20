package com.findingworker.dto;

import com.findingworker.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteProfileRequest {
    @NotBlank
    private String phone;

    @NotNull
    private Role role;
}
