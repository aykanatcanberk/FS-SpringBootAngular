import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from '../../services/utility-service';
import { MediaService } from '../../services/media-service';

@Component({
  selector: 'app-video-player',
  standalone: false,
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
})
export class VideoPlayer implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  currentTime = 0;
  duration = 0;
  volume = 1;
  isMuted = false;
  isFullscreen = false;
  showControls = true;
  controlsTimeout: any;
  private boundFullscreenHandler: any;
  private boundKeydownHandler: any;
  authenticatedVideoUrl: string | null = null;
  playbackRate = 1.0;
  availablePlaybackRates = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  resolutions = [
    { label: '1080p', src: '' },
    { label: '720p', src: '' },
    { label: '480p', src: '' },
    { label: 'Auto', src: '' }
  ];
  
  currentQuality = 'Auto';

  constructor(public dialogRef: MatDialogRef<VideoPlayer>,
    @Inject(MAT_DIALOG_DATA) public video: any,
    public utilityService: UtilityService,
    private mediaService: MediaService
  ) {
    this.boundFullscreenHandler = this.onFullscreenChange.bind(this)
    this.boundKeydownHandler = this.onKeyDown.bind(this)
    this.loadAuthenticatedVideo()
  }

  ngOnInit(): void {
    this.startControlsTimer()

    document.addEventListener('fullscreenchange', this.boundFullscreenHandler)
    document.addEventListener('keydown', this.boundKeydownHandler)

    this.dialogRef.beforeClosed().subscribe(() => {
      this.cleanup()
    })
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private loadAuthenticatedVideo(): void {
    // MediaService üzerinden güvenli URL al
    this.authenticatedVideoUrl = this.mediaService.getMediaUrl(this.video.src, 'video');
  }

  private cleanup() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }

    if (this.boundFullscreenHandler) {
      document.removeEventListener('fullscreenchange', this.boundFullscreenHandler);
    }
    if (this.boundKeydownHandler) {
      document.removeEventListener('keydown', this.boundKeydownHandler);
    }

    // Video elementini sıfırla
    if (this.videoElement?.nativeElement) {
      const video = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
      video.src = '';
      video.load();
      this.isPlaying = false;
    }

    // Eğer tam ekrandaysa çık
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        event.preventDefault()
        this.togglePlay()
        break
      case 'arrowleft':
        event.preventDefault()
        this.seekBackward()
        break
      case 'arrowright':
        event.preventDefault()
        this.seekForward()
        break
      case 'arrowup':
        event.preventDefault()
        this.increaseVolume()
        break
      case 'arrowdown':
        event.preventDefault()
        this.decreaseVolume()
        break
      case 'm':
        event.preventDefault()
        this.toggleMute()
        break
      case 'f':
        event.preventDefault()
        this.toggleFullscreen()
        break
      case 'escape':
        if (document.fullscreenElement) {
          event.preventDefault()
          document.exitFullscreen()
        } else {
          this.closePlayer()
        }
        break
    }
  }
  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement
  }

  onLoadedMetadata() {
    if (this.videoElement?.nativeElement) {
      this.duration = this.videoElement.nativeElement.duration;
    }
  }

  onTimeUpdate() {
    if (this.videoElement?.nativeElement) {
      this.currentTime = this.videoElement.nativeElement.currentTime;
    }
  }

  onMouseMove() {
    this.showControls = true;
    this.startControlsTimer();
  }

  onVideoClick() {
    this.togglePlay();
  }

  onProgressClick(event: MouseEvent) {
    if (!this.videoElement?.nativeElement || !this.duration) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const newTime = pos * this.duration;

    this.videoElement.nativeElement.currentTime = newTime;
    this.currentTime = newTime;
  }

  togglePlay() {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    this.pauseAllOtherVideos(video);

    if (video.paused) {
      video.play().then(() => {
        this.isPlaying = true;
      }).catch(err => {
        console.error("Play error:", err);
        this.isPlaying = false;
      });
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  private pauseAllOtherVideos(currentVideo: HTMLVideoElement) {
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((video: HTMLVideoElement) => {
      if (video !== currentVideo && !video.paused) {
        video.pause();
      }
    });
  }

  seekForward() {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;

    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  }

  seekBackward() {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.currentTime = Math.max(0, video.currentTime - 10);
  }

  toggleMute() {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  changeVolume(event: Event) {
    if (!this.videoElement?.nativeElement) return;

    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    this.setVolume(value);
    this.isMuted = this.volume === 0;
  }

  increaseVolume() {
    if (!this.videoElement?.nativeElement) return;

    const newVolume = Math.min(1, this.volume + 0.1);
    this.setVolume(newVolume);

    this.isMuted = false;
    this.videoElement.nativeElement.muted = false;
  }

  decreaseVolume() {
    if (!this.videoElement?.nativeElement) return;

    const newVolume = Math.max(0, this.volume - 0.1);
    this.setVolume(newVolume);
    this.isMuted = newVolume === 0;
  }

  private setVolume(value: number) {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    video.volume = value;
    this.volume = value;
  }

  toggleFullscreen() {
    const container = document.querySelector('.player-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  startControlsTimer() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.showControls = false;
      }
    }, 3000);
  }

  closePlayer() {
    this.dialogRef.close();
  }

  formatTime(seconds: number): string {
    return this.utilityService.formatDuration(seconds);
  }

  get videoSrc(): string | null {
    return this.authenticatedVideoUrl;
  }

  get progressPercent(): number {
    return this.duration ? (this.currentTime / this.duration) * 100 : 0;
  }

  get volumePercent(): number {
    return this.volume * 100;
  }

  setPlaybackSpeed(speed: number) {
    if (!this.videoElement?.nativeElement) return;

    this.playbackRate = speed;
    this.videoElement.nativeElement.playbackRate = speed;
  }

  setQuality(resolution: any) {
    if (this.currentQuality === resolution.label) return;

    const currentTime = this.videoElement.nativeElement.currentTime;
    const wasPlaying = !this.videoElement.nativeElement.paused;

    this.currentQuality = resolution.label;
    
    console.log(`Kalite değiştirildi: ${resolution.label} (Simüle ediliyor)`);
  
  }

}