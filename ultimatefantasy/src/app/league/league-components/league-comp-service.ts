import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { Observable, from, map, switchMap, filter, take, tap, of, pipe } from 'rxjs';
import { SupabaseService } from '../../backend/supabase';
import { AuthService } from '../../core/auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LeagueCompService {

  constructor(private http: HttpClient, private supabase: SupabaseService, private authService: AuthService) { }

  getAllRosters(leagueId): Observable<any[]> {

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
  );  }

  rosterCreate(leagueId: string, teamName: string, userId: string): Observable<any> {
    if (!leagueId || leagueId === 'null') {
      return of(null);
    }

    return this.http.post<any>(`/api/leagues/${leagueId}/rosters`, { teamName, userId });
  }
}

