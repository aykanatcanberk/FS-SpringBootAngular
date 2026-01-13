package com.movie.app.service.impl;

import com.movie.app.dto.request.UserRequest;
import com.movie.app.dto.response.MessageResponse;
import com.movie.app.entity.User;
import com.movie.app.enums.Role;
import com.movie.app.exception.EmailAlreadyExistException;
import com.movie.app.repository.UserRepository;
import com.movie.app.security.JwtUtils;
import com.movie.app.service.AuthService;
import com.movie.app.service.EmailService;
import com.movie.app.util.ServiceUtils;
import lombok.RequiredArgsConstructor;
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
}
