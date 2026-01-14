package com.movie.app.controller;

import com.movie.app.dto.request.UserRequest;
import com.movie.app.dto.response.MessageResponse;
import com.movie.app.dto.response.PageResponse;
import com.movie.app.dto.response.UserResponse;
import com.movie.app.entity.User;
import com.movie.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<MessageResponse> createUser(@RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(userService.createUser(userRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> updateUser(@PathVariable("id") Long id, @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(userService.updateUser(id, userRequest));
    }

    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(userService.getUsers(page, size, search));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable("id") Long id, Authentication authentication) {
        String currentUserMail = authentication.getName();
        return ResponseEntity.ok(userService.deleteUser(id, currentUserMail));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<MessageResponse> toggleStatus(@PathVariable("id") Long id, Authentication authentication) {
        String currentUserMail = authentication.getName();
        return ResponseEntity.ok(userService.toggleUserStatus(id, currentUserMail));
    }

    @PutMapping("/{id}/change-role")
    public ResponseEntity<MessageResponse> changeRole(@PathVariable("id") Long id, @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(userService.changeUserRole(id,userRequest));
    }
}
