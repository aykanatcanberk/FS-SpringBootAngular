import { Component, HostListener, OnInit } from '@angular/core';
import { DiaolagService } from '../../shared/services/diaolag-service';
import { NotificationService } from '../../shared/services/notification-service';
import { UtilityService } from '../../shared/services/utility-service';
import { VideoService } from '../../shared/services/video-service';
import { MediaService } from '../../shared/services/media-service';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle'; // Bunu ekleyin

@Component({
  selector: 'app-video-list',
  standalone: false,
  templateUrl: './video-list.html',
  styleUrl: './video-list.css',
})
export class VideoList implements OnInit {
  pagedVideos: any = [];
  loading = false;
  loadingMore = false;
  searchQuery = '';

  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  hasMoreVideos = true;

  totalVideos = 0;
  publishedVideos = 0;
  totalDurationSeconds = 0;

  //data = new MatTableDataSource<any>([]);

  constructor(private dialogService: DiaolagService,
    private notification: NotificationService,
    private videoService: VideoService,
    public utilityService: UtilityService,
    public mediaService: MediaService,
    private errorHandlerService: ErrorHandlerService
  ) { }
  ngOnInit(): void {
    this.load()
    this.loadStats()
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore && !this.loading && this.hasMoreVideos) {
      this.loadMoreVideos();
    }
  }

  load() {
    this.loading = true;
    this.currentPage = 0;
    const search = this.searchQuery.trim() || undefined;

    this.videoService.getAllAdminVideos(this.currentPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        console.log('API Response:', response); 
        this.pagedVideos = response.messages || response.content || []; 

        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        
        this.hasMoreVideos = response.totalPages > 0 && response.number < response.totalPages - 1;
        
        this.loading = false;
        
        console.log('Atanan Videolar:', this.pagedVideos);
      },
      error: (err) => {
        this.loading = false;
        this.loadingMore = false;
        this.errorHandlerService.handle(err, 'Failed to load videos.');
      }
    });
  }

  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;

    this.videoService.getAllAdminVideos(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.pagedVideos = [...this.pagedVideos, ...response.content];
        this.currentPage = response.number;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        this.loadingMore = false;
      },
      error: (err) => {
        this.loadingMore = false;
        this.errorHandlerService.handle(err, 'Failed to load more videos');
      }
    });
  }

  loadStats() {
    this.videoService.getStatsByAdmin().subscribe({
      next: (stats: any) => {
        console.log('İstatistik Yanıtı:', stats);

        this.totalVideos = stats.totalVideos || 0;
        this.publishedVideos = stats.publishedVideos || 0;
        
        this.totalDurationSeconds = stats.totalDuration || stats.duration || 0; 
      },
      error: (err) => {
        console.error('İstatistikler yüklenemedi:', err);
      }
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.currentPage = 0;
    this.load();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.load();
  }

  play(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  createNew() {
    const dialogRef = this.dialogService.openVideoFormDialog('create');
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.load();
        this.loadStats();
      }
    });
  }

  edit(video: any) {
    const dialogRef = this.dialogService.openVideoFormDialog('edit', video);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.load();
        this.loadStats();
      }
    });
  }

  remove(video: any) {
    this.dialogService.openConfirmation(
      'Delete Video',
      `Are you sure you want to delete "${video.title}"?`,
      'Delete',
      'Cancel',
      'danger'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.loading = true; 
        this.videoService.deleteVideoByAdmin(video.id).subscribe({
          next: () => {
            this.notification.success('Video deleted successfully');
            
            if (this.pagedVideos.length === 1 && this.currentPage > 0) {
              this.currentPage--;
            }
            
            this.load();      
            this.loadStats(); 
          },
          error: (err) => {
            this.loading = false;
            this.errorHandlerService.handle(err, 'Failed to delete video');
          }
        });
      }
    });
  }

  togglePublish(event: MatSlideToggleChange, video: any) {
    const oldState = video.published;
    const newState = event.checked;

    video.published = newState;

    this.videoService.setPublishedByAdmin(video.id, newState).subscribe({
      next: () => {
        this.notification.success(`Video ${newState ? 'Published' : 'Unpublished'} successfully`);
        this.loadStats(); 
      },
      error: (err) => {
        console.error('Publish Hatası:', err);
        
        video.published = oldState; 
        event.source.checked = oldState; 
        
        this.errorHandlerService.handle(err, 'Failed to update status');
      }
    });
  }

  getPublishedCount(): number {
    return this.publishedVideos;
  }

  getTotalDuration(): string {
    const total = this.totalDurationSeconds;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatDuration(seconds: number): string {
    return this.utilityService.formatDuration(seconds);
  }

  getPosterUrl(video: any) {
    return this.mediaService.getMediaUrl(video, 'image', {
      userCache: true
    });
  }
}
