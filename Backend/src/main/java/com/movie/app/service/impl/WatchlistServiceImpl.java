package com.movie.app.service.impl;

import com.movie.app.dto.response.MessageResponse;
import com.movie.app.dto.response.PageResponse;
import com.movie.app.dto.response.VideoResponse;
import com.movie.app.entity.User;
import com.movie.app.entity.Video;
import com.movie.app.repository.UserRepository;
import com.movie.app.repository.VideoRepository;
import com.movie.app.service.WatchlistService;
import com.movie.app.util.PaginationUtils;
import com.movie.app.util.ServiceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class WatchlistServiceImpl implements WatchlistService {

    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final ServiceUtils serviceUtils;

    @Override
    public MessageResponse addWatchList(String email, Long videoId) {

        User user = serviceUtils.getUserByEmail(email);
        Video video = serviceUtils.getVideoById(videoId);

        user.addWatchlist(video);
        userRepository.save(user);
        return new MessageResponse("Video added to watchlist successfully.");
    }

    @Override
    public MessageResponse removeWatchList(String email, Long videoId) {
        User user = serviceUtils.getUserByEmail(email);
        Video video = serviceUtils.getVideoById(videoId);

        user.removeWatchlist(video);
        userRepository.save(user);
        return new MessageResponse("Video removed from watchlist successfully.");
    }

    @Override
    public PageResponse<VideoResponse> getWatchListPaginated(String email, int page, int size, String search) {

        User user = serviceUtils.getUserByEmail(email);
        Pageable pageable = PaginationUtils.createPageRequest(page, size);
        Page<Video> videoPage;

        if (search != null && !search.trim().isEmpty()) {
            videoPage = userRepository.searchWatchlistByUserId(user.getId(), search.trim(), pageable);
        } else {
            videoPage = userRepository.findWatchlistByUserId(user.getId(), pageable);
        }
        return PaginationUtils.toPageResponse(videoPage, VideoResponse::fromEntity);
    }
}
