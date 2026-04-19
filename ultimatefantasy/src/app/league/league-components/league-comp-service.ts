import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LeagueCompService {


  


  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    
  }

 

  getProfile(): Observable<any> {
    return this.http.get('/api/profile');
  }

  getUsersRosterId(leagueId: string, userId: string): Observable<string> {
    return this.http
      .get<{ rosterId: string }>(`/api/leagues/${leagueId}/rosters/user/${userId}`)
      .pipe(map(res => res.rosterId)); 
  }

  
  getAllPlayers(leagueId: string, rosterId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/rosters/${rosterId}`);
  }

  getDraftStatus(leagueId: string): Observable<string> {
    return this.http.get<{ draftStatus: string }>(`/api/draft/${leagueId}/status`).pipe(
      map(res => res.draftStatus)
    );
  }

  
  getOwnerId(rosterId: string): Observable<string> {
    return this.http.get<{ ownerId: string }>(`/api/rosters/${rosterId}/owner-id`).pipe(
      map(res => res.ownerId)
    );
  }

  getAllRosters(leagueId: string): Observable<any[]> {

    return this.http.get<any[]>(`/api/leagues/${leagueId}/rosters`);
  }

  canCreateRoster(leagueId: string, userId: string): Observable<boolean> {
    if (!leagueId || leagueId === 'null') {
      return of(false);
    }

    return this.http.get<{ canCreate: boolean }>(
      `/api/leagues/${leagueId}/rosters/can-create?userId=${userId}`
    ).pipe(
      map(res => res.canCreate)
    );
  }

  rosterCreate(leagueId: string, teamName: string, userId: string, userName: string | null): Observable<any> {
    if (!leagueId || leagueId === 'null') {
      return of(null);
    }
    console.log('Creating roster with:', { leagueId, teamName, userId, userName });

    return this.http.post<any>(`/api/leagues/${leagueId}/rosters`, { teamName, userId, userName });
  }

  getFreeAgents(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/freeagents`);
  }

  changePlayerPosition(leagueId: string, rosterId: string, characterId: string, newPosition: string): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/rosters/${rosterId}/players/${characterId}/position`, { newPosition });
  }

  removePlayer(leagueId: string, rosterId: string, characterId: string): Observable<any> {
    return this.http.delete(`/api/leagues/${leagueId}/rosters/${rosterId}/players/${characterId}`);
  }

  addPlayerToRoster(leagueId: string, rosterId: string, characterId: string): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/rosters/${rosterId}/players/${characterId}`, {});
  }

  changePlayerBattingOrder(leagueId: string, rosterId: string, characterId: string, newOrder: number): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/rosters/${rosterId}/players/${characterId}/batting-order`, { newBattingOrder:  newOrder } );
  }

  deleteLeague(leagueId: string): Observable<any> {
    return this.http.delete(`/api/leagues/${leagueId}`);
  }

  updateDraftSettings(leagueId: string, newSetting: string): Observable<any> {
    console.log('Updating draft settings for league:', leagueId, 'with new setting:', newSetting);
    return this.http.post(`/api/leagues/${leagueId}/draft-settings`, { draftSettings: newSetting });
  }

  updateRosterLimit(leagueId: string, newLimit: number): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/roster-limit`, { rosterLimit: newLimit });
  }
}

