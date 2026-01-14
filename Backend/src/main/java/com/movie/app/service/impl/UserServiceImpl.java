package com.movie.app.service.impl;

import com.movie.app.dto.request.UserRequest;
import com.movie.app.dto.response.MessageResponse;
import com.movie.app.dto.response.PageResponse;
import com.movie.app.dto.response.UserResponse;
import com.movie.app.entity.User;
import com.movie.app.enums.Role;
import com.movie.app.exception.EmailAlreadyExistException;
import com.movie.app.exception.InvalidRoleException;
import com.movie.app.repository.UserRepository;
import com.movie.app.service.EmailService;
import com.movie.app.service.UserService;
import com.movie.app.util.PaginationUtils;
import com.movie.app.util.ServiceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServiceUtils serviceUtils;
    private final EmailService emailService;

    @Override
    public MessageResponse createUser(UserRequest userRequest) {
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new EmailAlreadyExistException("Email already exist");
        }
        validateRole(userRequest.getRole());
        User user = new User();
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFullName(userRequest.getFullName());
        user.setRole(Role.valueOf(userRequest.getRole().toUpperCase()));
        user.setActive(true);
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiresAt(Instant.now().plusSeconds(86400));
        userRepository.save(user);
        emailService.sendVerificationEmail(userRequest.getEmail(), verificationToken);

        return new MessageResponse("User created successfully");
    }

    private void validateRole(String role) {
        if (Arrays.stream(Role.values()).noneMatch(r -> r.name().equalsIgnoreCase(role))) {
            throw new InvalidRoleException("Invalid role: " + role);
        }
    }

    @Override
    public MessageResponse updateUser(Long id, UserRequest userRequest) {
        User user = serviceUtils.getUserById(id);

        ensureNotLastActiveAdmin(user);
        validateRole(userRequest.getRole());

        user.setFullName(userRequest.getFullName());
        user.setRole(Role.valueOf(userRequest.getRole().toUpperCase()));
        userRepository.save(user);
        return new MessageResponse("User updated successfully");
    }

    private void ensureNotLastActiveAdmin(User user) {
        if (user.isActive() && user.getRole() == Role.ADMIN) {
            long activeAdminCount = userRepository.countByRoleAndActive(Role.ADMIN, true);
            if (activeAdminCount <= 1) {
                throw new RuntimeException("Cannot deactivate last admin user. ");
            }
        }
    }

    @Override
    public PageResponse<UserResponse> getUsers(int page, int size, String search) {
        Pageable pageable = PaginationUtils.createPageRequest(page, size, "id");

        Page<User> userPage;

        if (search != null && !search.trim().isEmpty()) {
            userPage = userRepository.searchUsers(search.trim(), pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return PaginationUtils.toPageResponse(userPage, UserResponse::fromEntity);
    }

    @Override
    public MessageResponse deleteUser(Long id, String currentUserEmail) {

        User user = serviceUtils.getUserById(id);

        if (user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("You can not delete user by current user email");
        }

        ensureNotLastAdmin(user, "delete");
        userRepository.deleteById(id);

        return new MessageResponse("User deleted successfully");
    }

    private void ensureNotLastAdmin(User user, String operation) {
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot" + operation + " the last admin user. ");
            }
        }
    }

    @Override
    public MessageResponse toggleUserStatus(Long id, String currentUserMail) {
        User user = serviceUtils.getUserById(id);
        if (user.getEmail().equals(currentUserMail)) {
            throw new RuntimeException("You can not toggle user by current user email");
        }
        ensureNotLastActiveAdmin(user);

        user.setActive(!user.isActive());
        userRepository.save(user);
        return new MessageResponse("User status updated successfully");
    }

    @Override
    public MessageResponse changeUserRole(Long id, UserRequest userRequest) {
        User user = serviceUtils.getUserById(id);
        validateRole(userRequest.getRole());

        Role newRole = Role.valueOf(userRequest.getRole().toUpperCase());
        if( user.getRole() == Role.ADMIN && newRole == Role.USER) {
            ensureNotLastAdmin(user, "change the role of");
        }

        user.setRole(newRole);
        userRepository.save(user);
        return new MessageResponse("User role updated successfully");
    }

}
