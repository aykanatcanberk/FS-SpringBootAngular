import { Injectable } from '@angular/core';
import { NotificationService } from './notification-service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private notification: NotificationService){}

  handle(err: any , fallbackMessage:String){
    const errorMsg = err.error?.error || fallbackMessage
    console.error('API error:', err)
  }
  
}
