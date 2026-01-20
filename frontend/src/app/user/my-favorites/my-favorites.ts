import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { WatchlistService } from '../../shared/services/watchlist-service';
import { NotificationService } from '../../shared/services/notification-service';
import { UtilityService } from '../../shared/services/utility-service';
import { MediaService } from '../../shared/services/media-service';
import { DiaolagService } from '../../shared/services/diaolag-service';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';

@Component({
  selector: 'app-my-favorites',
  standalone: false,
  templateUrl: './my-favorites.html',
  styleUrl: './my-favorites.css',
})
export class MyFavorites implements OnInit, OnDestroy {
  videos: any[] = [];
  featuredVideo: any = null;

  loading = true;
  loadingMore = false;
  error = false;
  searchQuery: string = '';

  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  totalPages = 0;
  hasMoreVideos = true;

  private searchSubject = new Subject<string>();

  constructor(
    private watchlistService: WatchlistService,
    private notification: NotificationService,
    public utilityService: UtilityService,
    public mediaService: MediaService,
    private dialogService: DiaolagService,
    private errorHandlerService: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.loadWatchlist();
    this.initializeSearchDebounce();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  initializeSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadWatchlist();
    });
  }

  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadWatchlist();
  }

  loadWatchlist() {
    this.error = false;
    if (this.currentPage === 0) {
      this.videos = [];
      this.featuredVideo = null;
    }

    this.loading = true;
    const search = this.searchQuery.trim() || undefined;

    this.watchlistService.getWatchlist(this.currentPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        const content = response.content || response.messages || [];

        this.videos = content;

        if (this.currentPage === 0 && this.videos.length > 0 && !search) {
          this.featuredVideo = this.videos[0];
        }

        this.currentPage = response.number || 0;
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.videos = [];
        this.errorHandlerService.handle(err, 'Failed to load watchlist');
      }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore && !this.loading && this.hasMoreVideos) {
      this.loadMoreVideos();
    }
  }

  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;

    this.watchlistService.getWatchlist(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        const newContent = response.content || response.messages || [];
        this.videos = [...this.videos, ...newContent];
        this.currentPage = response.number;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        this.loadingMore = false;
      },
      error: (err) => {
        this.loadingMore = false;
        this.notification.error('Failed to load more videos');
      }
    });
  }

  removeFromWatchlist(video: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.watchlistService.removeFromWatchlist(video.id).subscribe({
      next: () => {
        this.notification.success('Removed from watchlist');

        this.videos = this.videos.filter(v => v.id !== video.id);
        this.totalElements--;

        if (this.featuredVideo && this.featuredVideo.id === video.id) {
          this.featuredVideo = this.videos.length > 0 ? this.videos[0] : null;
        }

      },
      error: (err) => {
        this.errorHandlerService.handle(err, 'Failed to remove from watchlist');
      }
    });
  }

  playVideo(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  getPosterUrl(video: any) {
    return this.mediaService.getMediaUrl(video, 'image', { userCache: true }) || '';
  }

  formatDuration(seconds: number | undefined): string {
    return this.utilityService.formatDuration(seconds);
  }
}