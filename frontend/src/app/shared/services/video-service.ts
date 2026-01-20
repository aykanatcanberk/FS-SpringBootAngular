import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = environment.apiUrl + '/videos'; 
  private apiUrlAdmin = environment.apiUrl + '/videos/admin';

  constructor(private http: HttpClient) { }

  updateVideoByAdmin(id: string | number, data: any) {
    return this.http.put(`${this.apiUrlAdmin}/${id}`, data);
  }

  setPublishedByAdmin(id: string | number, published: boolean) {
    return this.http.patch(`${this.apiUrlAdmin}/${id}/publish?value=${published}`, {});
  }

  getAllAdminVideos(page: number, size: number, search?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (search) {
      params = params.set('search', search);
    }
    return this.http.get(this.apiUrlAdmin, { params });
  }

  createVideoByAdmin(data: any) {
    return this.http.post(this.apiUrlAdmin, data);
  }

  deleteVideoByAdmin(id: string | number) {
    return this.http.delete(`${this.apiUrlAdmin}/${id}`);
  }

  getStatsByAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrlAdmin}/stats`);
  }

  getPublishedVideoPaginated(page: number = 0, size: number = 10, search?: string, category?: string | undefined) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/published`, { params });
  }

  getFeaturedVideos() {
    return this.http.get(`${this.apiUrl}/featured`);
  }
}