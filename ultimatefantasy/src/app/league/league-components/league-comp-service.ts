import { Injectable } from '@angular/core';
import { Observable,  map, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LeagueCompService {

  constructor(private http: HttpClient) { }

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

