package com.movie.app.service;

import com.movie.app.dto.response.MessageResponse;
import com.movie.app.dto.response.PageResponse;
import com.movie.app.dto.response.VideoResponse;

public interface WatchlistService {
    MessageResponse addWatchList(String email, Long videoId);

    MessageResponse removeWatchList(String email, Long videoId);

    PageResponse<VideoResponse> getWatchListPaginated(String email, int page, int size, String search);
}
