package com.movie.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoStatsResponse {

    private Long totalVideos;
    private long publishedVideos;
    private long totalDuration;
}
