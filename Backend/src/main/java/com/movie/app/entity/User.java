package com.movie.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.movie.app.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Setter
@Getter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(unique = true)
    private String verificationToken;

    @Column
    private Instant verificationTokenExpiresAt;

    @Column
    private String passwordResetToken;

    @Column
    private Instant passwordResetTokenExpiresAt;

    @CreationTimestamp
    @Column(nullable = false , updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_watchlist",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "video_id")
    )
    private Set<Video> watchlist =  new HashSet<>();

    public void  addWatchlist(Video video) {
        this.watchlist.add(video);
    }
    public void removeWatchlist(Video video) {
        this.watchlist.remove(video);
    }
}

