package com.movie.app.controller;

import com.movie.app.dto.response.MessageResponse;
import com.movie.app.dto.response.PageResponse;
import com.movie.app.dto.response.VideoResponse;
import com.movie.app.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @PostMapping("/{videoId}")
    public ResponseEntity<MessageResponse> addWatchList(@PathVariable Long videoId, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(watchlistService.addWatchList(email, videoId));
    }

    @DeleteMapping("/{videoId}")
    ResponseEntity<MessageResponse> deleteWatchList(@PathVariable Long videoId, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(watchlistService.removeWatchList(email, videoId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<VideoResponse>> getWatchList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        String email = authentication.getName();

        PageResponse<VideoResponse> response = watchlistService.getWatchListPaginated(email, page, size, search);
        return ResponseEntity.ok(response);
    }
}
