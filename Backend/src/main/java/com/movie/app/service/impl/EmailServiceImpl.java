package com.movie.app.service.impl;

import com.movie.app.exception.EmailNotVerifiedException;
import com.movie.app.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Logger için en temiz yöntem
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendVerificationEmail(String email, String token) {
        try {
            String verificationLink = frontendUrl + "/verify-email?token=" + token;

            String emailBody = """
                    Dear User,
                    
                    Welcome to Movie App! We are excited to have you on board.
                    
                    To complete your registration and verify your account, please click the link below:
                    %s
                    
                    This link will expire in 24 hours. If you did not create an account, please ignore this email.
                    
                    Best regards,
                    The Movie App Team
                    """.formatted(verificationLink);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Action Required: Verify your email address");
            message.setText(emailBody);

            javaMailSender.send(message);
            log.info("Verification email sent to: {}", email);

        } catch (Exception e) {
            log.error("Error sending verification email: {}", e.getMessage());
            throw new EmailNotVerifiedException("Failed to send verification email");
        }
    }

    @Override
    public void sendPasswordResetEmail(String email, String token) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            String emailBody = """
                    Dear User,
                    
                    We received a request to reset the password for your Movie App account.
                    
                    You can reset your password by clicking the link below:
                    %s
                    
                    If you did not request a password reset, please ignore this email or contact support if you have concerns. This link is valid for 15 minutes.
                    
                    Best regards,
                    The Movie App Team
                    """.formatted(resetLink);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Security Alert: Reset your password");
            message.setText(emailBody);

            javaMailSender.send(message);
            log.info("Password reset email sent to: {}", email);

        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage());
            throw new EmailNotVerifiedException("Failed to send password reset email");
        }
    }
}