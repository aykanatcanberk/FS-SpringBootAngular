package com.movie.app.service;

import com.movie.app.dto.request.VideoRequest;
import com.movie.app.dto.response.MessageResponse;
import com.movie.app.dto.response.PageResponse;
import com.movie.app.dto.response.VideoResponse;
import com.movie.app.dto.response.VideoStatsResponse;
import jakarta.validation.Valid;

import java.util.List;

public interface VideoService {
    MessageResponse createVideoByAdmin(@Valid VideoRequest videoRequest);

    PageResponse<VideoResponse> getAllAdminVideos(int page, int size, String search);

    MessageResponse updateVideoByAdmin(Long id, @Valid VideoRequest videoRequest);

    MessageResponse deleteVideoByAdmin(Long id);

    MessageResponse toggleVideoPublishStatusByAdmin(Long id , boolean value);

    VideoStatsResponse getAdminStats();

    PageResponse<VideoResponse> getPublishedVideos(int page, int size, String search, String email);

    List<VideoResponse> getFeaturedVideos();
}
