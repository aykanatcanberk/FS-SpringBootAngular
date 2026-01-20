import { Component, ErrorHandler, HostListener, OnInit, OnDestroy } from '@angular/core'; // OnDestroy eklendi
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { VideoService } from '../../shared/services/video-service';
import { WatchlistService } from '../../shared/services/watchlist-service';
import { NotificationService } from '../../shared/services/notification-service';
import { UtilityService } from '../../shared/services/utility-service';
import { MediaService } from '../../shared/services/media-service';
import { DiaolagService } from '../../shared/services/diaolag-service';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  allvideos: any[] = [];
  filteredVideos: any[] = [];

  loading = true;
  loadingMore = false;
  error = false;
  searchQuery: string = '';

  featuredVideos: any[] = [];
  currentSlideIndex = 0;
  featuredLoading = true;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasMoreVideos = true;

  private searchSubject = new Subject<String>();
  private sliderInterval: any;
  private savedScrollPosition: number = 0;

  constructor(
    private videoService: VideoService,
    private watchlistService: WatchlistService,
    private notification: NotificationService,
    public utilityService: UtilityService,
    public mediaService: MediaService,
    private dialogService: DiaolagService,
    private errorHandlerService: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.loadFeaturedVideos();
    this.loadVideos();
    this.initializeSearchDebounce();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
    this.stopSlider();
  }

  initializeSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.performSearch()
    });
  }

  loadFeaturedVideos() {
    this.featuredLoading = true;
    this.videoService.getFeaturedVideos().subscribe({
      next: (videos: any) => {
        this.featuredVideos = videos || [];
        this.featuredLoading = false;
        if (this.featuredVideos.length > 1) {
          this.startSlider();
        }
      },
      error: (err) => {
        this.featuredLoading = false;
        this.featuredVideos = [];
        this.errorHandlerService.handle(err, 'Error loading featured videos');
      }
    });
  }

  private startSlider() {
    this.stopSlider();
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  private stopSlider() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextSlide() {
    if (this.featuredVideos && this.featuredVideos.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.featuredVideos.length;
    }
  }

  prevSlide() {
    if (this.featuredVideos && this.featuredVideos.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex - 1 + this.featuredVideos.length) % this.featuredVideos.length;
    }
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
    this.stopSlider();
    if (this.featuredVideos.length > 1) {
      this.startSlider();
    }
  }

  getCurrentFeaturedVideo() {
    return this.featuredVideos && this.featuredVideos.length > 0
      ? this.featuredVideos[this.currentSlideIndex]
      : null;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore && !this.loading && this.hasMoreVideos) {
      this.loadMoreVideos();
    }
  }

  loadVideos(page: number = 0) {
    this.error = false;

    if (this.currentPage === 0) {
      this.allvideos = [];
      this.filteredVideos = [];
    }

    const search = this.searchQuery.trim() || undefined;
    const isSearching = !!search;
    this.loading = true;

    this.videoService.getPublishedVideoPaginated(this.currentPage, this.pageSize, search).subscribe({
      next: (response: any) => {

        const content = response.content || response.messages || [];

        this.allvideos = content;
        this.filteredVideos = content;

        this.currentPage = response.number || 0;
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        this.loading = false;

        if (isSearching && this.savedScrollPosition > 0) {
          setTimeout(() => {
            window.scrollTo({
              top: this.savedScrollPosition,
              behavior: 'auto'
            });
            this.savedScrollPosition = 0;
          }, 0);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorHandlerService.handle(err, 'Failed to load videos');
        this.error = true;
        this.allvideos = [];
        this.savedScrollPosition = 0;
      }
    });
  }

  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;

    this.videoService.getPublishedVideoPaginated(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        const newContent = response.content || response.messages || [];

        this.allvideos = [...this.allvideos, ...newContent];
        this.filteredVideos = [...this.filteredVideos, ...newContent];

        this.currentPage = response.number;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        this.loadingMore = false;
      },
      error: (err) => {
        this.notification.error('Failed to load more videos');
        this.loadingMore = false;
      }
    });
  }

  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  private performSearch() {
    this.savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.currentPage = 0;
    this.loadVideos();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.savedScrollPosition = 0;
    this.loadVideos();
  }

  isInWatchlist(video: any): boolean {
    return video?.isInWatchlist === true;
  }

  toggleWatchlist(video: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.isInWatchlist(video)) {
      this.watchlistService.removeFromWatchlist(video.id).subscribe({
        next: () => {
          video.isInWatchlist = false;
          this.notification.success('Removed from watchlist');
        },
        error: (err) => this.errorHandlerService.handle(err, 'Failed to remove from watchlist')
      });
    } else {
      this.watchlistService.addToWatchlist(video.id).subscribe({
        next: () => {
          video.isInWatchlist = true;
          this.notification.success('Added to My Favorites');
        },
        error: (err) => this.errorHandlerService.handle(err, 'Failed to add to My Favorites')
      });
    }
  }

  getPosterUrl(video: any) {
    return this.mediaService.getMediaUrl(video, 'image', {
      userCache: true
    }) || '';
  }

  playVideo(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  formatDuration(seconds: number | undefined): string {
    return this.utilityService.formatDuration(seconds);
  }
}