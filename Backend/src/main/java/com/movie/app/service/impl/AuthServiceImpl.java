package com.movie.app.service.impl;

import com.movie.app.dto.request.LoginRequest;
import com.movie.app.dto.request.UserRequest;
import com.movie.app.dto.response.EmailValidationResponse;
import com.movie.app.dto.response.LoginResponse;
import com.movie.app.dto.response.MessageResponse;
import com.movie.app.entity.User;
import com.movie.app.enums.Role;
import com.movie.app.exception.AccountDeactivatedException;
import com.movie.app.exception.EmailAlreadyExistException;
import com.movie.app.exception.EmailNotVerifiedException;
import com.movie.app.exception.InvalidTokenException;
import com.movie.app.repository.UserRepository;
import com.movie.app.security.JwtUtils;
import com.movie.app.service.AuthService;
import com.movie.app.service.EmailService;
import com.movie.app.util.ServiceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;
    private final ServiceUtils serviceUtils;

    @Override
    public MessageResponse signup(UserRequest userRequest) {

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new EmailAlreadyExistException("Email already exist");
        }
        User user = new User();
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFullName(userRequest.getFullName());
        user.setRole(Role.USER);
        user.setActive(true);
        user.setEmailVerified(false);
        String verifivationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verifivationToken);
        user.setVerificationTokenExpiresAt(Instant.now().plusSeconds(86400));

        userRepository.save(user);
        emailService.sendVerificationEmail(userRequest.getEmail(), verifivationToken);
        return new MessageResponse("Registration successful. Please check your email and verify your account.");
    }

    @Override
    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            throw new AccountDeactivatedException("Account is deactivated. Please activate your account.");
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Email is not verified. Please verify your account. Check your email and verify your account.");
        }

        final String verifivationToken = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(verifivationToken, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Override
    public EmailValidationResponse validateEmail(String email) {
        boolean exists = userRepository.existsByEmail(email);
        return new EmailValidationResponse(exists, !exists);
    }

    @Override
    public MessageResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid token"));

        if (user.getVerificationTokenExpiresAt() == null || user.getVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException("Verification token is expired. Please request your new verification token.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);

        userRepository.save(user);

        return new MessageResponse("Email verified successfully.");
    }

    @Override
    public MessageResponse resendVerification(String email) {
        User user = serviceUtils.getUserByEmail(email);

        String verifivationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verifivationToken);
        user.setVerificationTokenExpiresAt(Instant.now().plusSeconds(86400));
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), verifivationToken);

        return new MessageResponse("Verification resend successfully. Please check your email and verify your account.");
    }

    @Override
    public MessageResponse forgotPassword(String email) {
        User user = serviceUtils.getUserByEmail(email);
        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiresAt(Instant.now().plusSeconds(3600));
        userRepository.save(user);
        emailService.sendPasswordResetEmail(email, resetToken);
        return new MessageResponse("Forgot password reset token successfully. Please check your inbox.");
    }

    @Override
    public MessageResponse resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid token"));
        if(user.getPasswordResetTokenExpiresAt()==null || user.getPasswordResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException("Password reset token is expired.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetTokenExpiresAt(null);
        user.setPasswordResetTokenExpiresAt(null);
        userRepository.save(user);

        return new MessageResponse("Password reset successfully.");
    }

    @Override
    public MessageResponse changePassword(String email, String currentPassword, String newPassword) {
        User user = serviceUtils.getUserByEmail(email);

        if(!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidTokenException("Current password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return new MessageResponse("Password changed successfully.");
    }

    @Override
    public LoginResponse getCurrentUser(String email) {
        User user = serviceUtils.getUserByEmail(email);
        return  new LoginResponse(null, user.getEmail(), user.getFullName(), user.getRole().name());
    }
}
