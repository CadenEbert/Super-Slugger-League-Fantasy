
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LeagueService {


  constructor(private http: HttpClient) { }

  getLeaguesForCurrentUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues?userId=${userId}`);
  }

 
  getProfile(): Observable<any> {
    return this.http.get('/api/profile');
  }

  createLeague(leagueName: string, roster_size: number, league_size: number): Observable<any> {
    return this.http.post('/api/leagues', { leagueName, roster_size, league_size });
  }

  getOwnerId(leagueId: string): Observable<string> {
    return this.http.get<{ ownerId: string }>(`/api/leagues/${leagueId}/owner-id`).pipe(
      map(res => res.ownerId)
    );
  }

  
  canDraft(leagueId: string): Observable<boolean> {
    return this.http.get<{ canDraft: boolean }>(`/api/draft/${leagueId}/can-draft`).pipe(
      map(response => response.canDraft)
    );
  }

  joinLeague(leagueId: string, userId: string): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/join`, { userId });
  }

  fetchLeagueDetails(leagueId: string): Observable<any> {
    return this.http.get(`/api/leagues/${leagueId}`);
  }


}