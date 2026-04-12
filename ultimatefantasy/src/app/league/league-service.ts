
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




  createLeague(leagueData: {
    leagueName: string;
    leagueDescription: string;
    leagueSize: number;
    draftSettings: any;
  }): Observable<any> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) throw new Error('User not found');
        return this.http.post('/api/leagues', { userId: user.id, ...leagueData });
      })
    );
  }

  fetchLeagueDetails(leagueId: string): Observable<any> {
    return this.http.get(`/api/leagues/${leagueId}`);
  }


}