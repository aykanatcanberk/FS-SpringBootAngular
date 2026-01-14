package com.movie.app.util;

import com.movie.app.dto.response.PageResponse;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@NoArgsConstructor
public class PaginationUtils {

    public static Pageable createPageRequest(int page, int size, String sort) {
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sort));
    }

    public static Pageable createPageRequest(int page, int size) {
        return PageRequest.of(page, size);
    }

    public static <T, R> PageResponse<R> toPageResponse(Page<T> page, Function<T, R> mapper) {
        List<R> content = page.getContent().stream().map(mapper).toList();

        return new PageResponse<>(content, page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());
    }

    public static <R> PageResponse<R> toPageResponse(Page<?> page, List<R> mapper) {
        return new PageResponse<>(
                mapper,
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

}
