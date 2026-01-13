package com.movie.app.service;

import com.movie.app.dto.request.UserRequest;
import com.movie.app.dto.response.MessageResponse;
import jakarta.validation.Valid;

public interface AuthService {
    MessageResponse signup(@Valid UserRequest userRequest);
}
