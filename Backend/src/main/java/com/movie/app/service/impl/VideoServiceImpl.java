package com.movie.app.service.impl;

import com.movie.app.dto.request.VideoRequest;
import com.movie.app.dto.response.MessageResponse;
import com.movie.app.dto.response.PageResponse;
import com.movie.app.dto.response.VideoResponse;
import com.movie.app.dto.response.VideoStatsResponse;
import com.movie.app.entity.Video;
import com.movie.app.repository.UserRepository;
import com.movie.app.repository.VideoRepository;
import com.movie.app.service.VideoService;
import com.movie.app.util.PaginationUtils;
import com.movie.app.util.ServiceUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoServiceImpl implements VideoService {

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final ServiceUtils serviceUtils;

    @Override
    public MessageResponse createVideoByAdmin(VideoRequest videoRequest) {

        Video video = new Video();
        video.setTitle(videoRequest.getTitle());
        video.setDescription(videoRequest.getDescription());
        video.setYear(videoRequest.getYear());
        video.setRating(videoRequest.getRating());
        video.setDuration(videoRequest.getDuration());
        video.setSrcUuid(videoRequest.getSrc());
        video.setPosterUuid(videoRequest.getPoster());
        video.setPublished(videoRequest.isPublished());
        video.setCategories(videoRequest.getCategories() != null ? videoRequest.getCategories() : List.of());

        videoRepository.save(video);

        return new MessageResponse("Video Created Successfully");
    }

    @Override
    public PageResponse<VideoResponse> getAllAdminVideos(int page, int size, String search) {
        Pageable pageable = PaginationUtils.createPageRequest(page, size, "id");
        Page<Video> videoPage;

        if (search != null && !search.trim().isEmpty()) {
            videoPage = videoRepository.searchVideos(search.trim(), pageable);
        } else {
            videoPage = videoRepository.findAll(pageable);
        }
        return PaginationUtils.toPageResponse(videoPage, VideoResponse::fromEntity);

    }

    @Override
    public MessageResponse updateVideoByAdmin(Long id, VideoRequest videoRequest) {

        Video video = new Video();

        video.setId(id);
        video.setTitle(videoRequest.getTitle());
        video.setDescription(videoRequest.getDescription());
        video.setYear(videoRequest.getYear());
        video.setRating(videoRequest.getRating());
        video.setDuration(videoRequest.getDuration());
        video.setSrcUuid(videoRequest.getSrc());
        video.setPosterUuid(videoRequest.getPoster());
        video.setPublished(videoRequest.isPublished());
        video.setCategories(videoRequest.getCategories() != null ? videoRequest.getCategories() : List.of());

        videoRepository.save(video);

        return new MessageResponse("Video Updated Successfully");
    }

    @Override
    public MessageResponse deleteVideoByAdmin(Long id) {
        if (!videoRepository.existsById(id)) {
            throw new IllegalArgumentException("Video id not found:" + id);
        }

        videoRepository.deleteById(id);
        return new MessageResponse("Video Deleted Successfully");
    }

    @Override
    public MessageResponse toggleVideoPublishStatusByAdmin(Long id, boolean status) {

        Video video = serviceUtils.getVideoById(id);
        video.setPublished(status);
        videoRepository.save(video);
        return new MessageResponse("Video Published Successfully");
    }

    @Override
    public VideoStatsResponse getAdminStats() {
        long totalVideo = videoRepository.count();
        long publishedVideos = videoRepository.countPublishedVideos();
        long totalDuration = videoRepository.getTotalDuration();

        return new VideoStatsResponse(totalVideo, publishedVideos, totalDuration);
    }

    @Override
    public PageResponse<VideoResponse> getPublishedVideos(int page, int size, String search, String email) {
        Pageable pageable = PaginationUtils.createPageRequest(page, size, "id");
        Page<Video> videoPage;

        if (search != null && !search.trim().isEmpty()) {
            videoPage = videoRepository.searchPublishedVideos(search.trim(), pageable);
        } else {
            videoPage = videoRepository.findPublishVideoPageable(pageable);
        }

        List<Video> videos = videoPage.getContent();

        Set<Long> watchlistIds = Set.of();
        if (!videos.isEmpty()) {
            try {
                List<Long> videoIds = videos.stream().map(Video::getId).toList();
                watchlistIds = userRepository.findWatchlistVideoIds(email, videoIds);
            } catch (Exception e) {
                watchlistIds = Set.of();
            }
        }
        Set<Long> finalWatchlistIds = watchlistIds;
        videos.forEach(video -> {
            video.setIsInWatchList(finalWatchlistIds.contains(video.getId()));
        });

        List<VideoResponse> videoResponses = videos.stream().map(VideoResponse::fromEntity).toList();
        return PaginationUtils.toPageResponse(videoPage, videoResponses);
    }

    @Override
    public List<VideoResponse> getFeaturedVideos() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Video> videos = videoRepository.findRandomPublishedVideos(pageable);

        return videos.stream().map(VideoResponse::fromEntity).toList();
    }
}
