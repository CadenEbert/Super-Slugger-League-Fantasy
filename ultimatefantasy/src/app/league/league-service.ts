
import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, filter, take, tap, of, pipe } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LeagueService {


  constructor(private http: HttpClient, private authService: AuthService) { }

  getLeaguesForCurrentUser(): Observable<any[]> {
    return this.http.get<any[]>('/api/leagues');
  }

 
  getProfile(): Observable<any> {
    return this.http.get('/api/profile');
  }

  createLeague(leagueData: {
    leagueName: string;
    roster_size: number;
    leagueSize: number;
    draftSettings: any;
    userName?: string;
  }): Observable<any> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) throw new Error('User not found');
        return this.http.post('/api/leagues', { userId: user.id, ...leagueData });
      })
    );
  }

  joinLeague(leagueId: string, userId: string): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/join`, { userId });
  }

  fetchLeagueDetails(leagueId: string): Observable<any> {
    return this.http.get(`/api/leagues/${leagueId}`);
  }


}