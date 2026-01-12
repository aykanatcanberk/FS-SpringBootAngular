package com.movie.app.dto.response;

import com.movie.app.entity.Video;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponse {
    private Long id;
    private String title;
    private String description;
    private Integer year;
    private String rating;

    private Integer duration;
    private  String src;
    private String poster;
    private boolean published;

    private List<String> categories;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean isInWatchlist;

    public static VideoResponse fromEntity(Video video) {
        VideoResponse response = new VideoResponse();
        response.setId(video.getId());
        response.setTitle(video.getTitle());
        response.setDescription(video.getDescription());
        response.setYear(video.getYear());
        response.setRating(video.getRating());
        response.setDuration(video.getDuration());
        response.setSrc(video.getSrc());
        response.setPoster(video.getPoster());
        response.setPublished(video.isPublished());
        response.setCategories(video.getCategories());
        response.setCreatedAt(video.getCreatedAt());
        response.setUpdatedAt(video.getUpdatedAt());

        if(video.getIsInWatchList()!=null) {
            response.setIsInWatchlist(video.getIsInWatchList());
        }
        return response;
    }
}
