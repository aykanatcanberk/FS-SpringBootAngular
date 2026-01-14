package com.movie.app.service;

import com.movie.app.dto.request.UserRequest;
import com.movie.app.dto.response.MessageResponse;
import com.movie.app.dto.response.PageResponse;
import com.movie.app.dto.response.UserResponse;

public interface UserService {
    MessageResponse createUser(UserRequest userRequest);

    MessageResponse updateUser(Long id, UserRequest userRequest);

    PageResponse<UserResponse> getUsers(int page, int size, String search);

    MessageResponse deleteUser(Long id, String currentUser);

    MessageResponse toggleUserStatus(Long id, String currentUserMail);

    MessageResponse changeUserRole(Long id, UserRequest userRequest);
}
