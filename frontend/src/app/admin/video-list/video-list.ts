import { Component } from '@angular/core';
import { DiaolagService } from '../../shared/services/diaolag-service';

@Component({
  selector: 'app-video-list',
  standalone: false,
  templateUrl: './video-list.html',
  styleUrl: './video-list.css',
})
export class VideoList {
  constructor(private dialogService : DiaolagService){}

  createNew(){
    const dialogRef = this.dialogService.openVideoFormDialog('create')
  }
}
