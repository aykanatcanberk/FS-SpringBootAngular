package com.movie.app.controller;

import com.movie.app.dto.request.UserRequest;
import com.movie.app.dto.response.MessageResponse;
import com.movie.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> signup(@Valid @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(authService.signup(userRequest));
    }
}
