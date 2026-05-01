import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get('/api/profile');
  }

  updateUsername(newUsername: string) {
    return this.http.put('/api/profile/username', { username: newUsername });
  }
}
