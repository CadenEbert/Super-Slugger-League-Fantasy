
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, switchMap, take } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class LeagueService {


  private userId$ = new BehaviorSubject<any>('');
  public user_id = this.userId$.asObservable();





  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.session$.pipe(
      filter(session => !!session),
      map(session => session.user.id)
    ).subscribe(userId => this.setUserId(userId));


  }


  setUserId(user_id: string) {

    this.userId$.next(user_id);

  }




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

  getDraftedPlayers(draftId: string): Observable<any> {
    return this.http.get(`/api/leagues/${draftId}/drafted-players`);
  }

  joinLeague(leagueId: string, userId: string): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/join`, { userId });
  }

  fetchLeagueDetails(leagueId: string): Observable<any> {
    return this.http.get(`/api/leagues/${leagueId}`);
  }

  leaveLeague(league_id: string): Observable<any> {
    return this.http.delete(`/api/league/${league_id}/leave`);
  }


}