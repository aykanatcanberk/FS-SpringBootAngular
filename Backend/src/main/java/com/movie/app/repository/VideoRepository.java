package com.movie.app.repository;

import com.movie.app.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    @Query("SELECT v FROM Video v WHERE " +
            "LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Video> searchVideos(@Param("search") String search, Pageable pageable);

    @Query("select count(v) from Video v where v.published=true ")
    long getTotalDuration();

    @Query("select coalesce(sum(v.duration), 0) from Video v")
    long countPublishedVideos();

    @Query("SELECT v FROM Video v WHERE v.published = true AND (" +
            "LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY v.createdAt DESC")
    Page<Video> searchPublishedVideos(String trim, Pageable pageable);

    @Query("select v from  Video v where v.published=true order by v.createdAt desc ")
    Page<Video> findPublishVideoPageable(Pageable pageable);

    @Query("select v from Video v where v.published=true order by function('RANDOM')")
    List<Video> findRandomPublishedVideos(Pageable pageable);
}
