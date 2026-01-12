package com.movie.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmailValidationResponse {

    private boolean exist;
    private  boolean available;

}
