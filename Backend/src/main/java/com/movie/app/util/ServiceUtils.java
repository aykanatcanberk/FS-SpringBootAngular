package com.movie.app.util;

import com.movie.app.entity.User;
import com.movie.app.entity.Video;
import com.movie.app.exception.ResourceNotFoundException;
import com.movie.app.repository.UserRepository;
import com.movie.app.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ServiceUtils {

    private UserRepository userRepository;
    private VideoRepository videoRepository;

    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(()->new ResourceNotFoundException("User not found with email:"+ email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("User not found with id:"+ id));
    }

    public Video getVideoById(Long id) {
        return videoRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Video not found with id:"+ id));
    }

}
