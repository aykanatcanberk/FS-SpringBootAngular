package com.movie.app.service;

import com.movie.app.dto.request.LoginRequest;
import com.movie.app.dto.request.UserRequest;
import com.movie.app.dto.response.EmailValidationResponse;
import com.movie.app.dto.response.LoginResponse;
import com.movie.app.dto.response.MessageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    MessageResponse signup(@Valid UserRequest userRequest);


    LoginResponse login(@NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email, @NotBlank(message = "Password is required") String password);

    EmailValidationResponse validateEmail(String email);

    MessageResponse verifyEmail(String token);

    MessageResponse resendVerification(@NotBlank(message = "Email is required.") @Email(message = "Invalid email format") String email);

    MessageResponse forgotPassword(@NotBlank(message = "Email is required.") @Email(message = "Invalid email format") String email);

    MessageResponse resetPassword(@NotBlank String token, @NotBlank @Size(min = 6, message = "New password must be at least 6 characters long.") String newPassword);

    MessageResponse changePassword(String email, @NotBlank(message = "Current Password is required") String currentPassword, @NotBlank(message = "New Password is required") String newPassword);

    LoginResponse getCurrentUser(String email);
}
