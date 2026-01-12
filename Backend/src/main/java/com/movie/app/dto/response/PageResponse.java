package com.movie.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> messages;
    private Long totalElements;
    private Integer totalPages;
    private Integer number;
    private Integer size;
}
