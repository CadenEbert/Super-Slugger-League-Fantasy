import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { Observable, from, map, switchMap, filter, take, tap, of, pipe } from 'rxjs';
import { SupabaseService } from '../../core/supabase';
import { AuthService } from '../../core/auth.service';


@Injectable({
  providedIn: 'root',
})
export class LeagueCompService {

  constructor(private supabase: SupabaseService, private authService: AuthService) { }

  getAllRosters(leagueId: string): Observable<any[]> {
    if (!leagueId || leagueId === 'null') {
      return of([]);
    }

    return defer(() =>
      from(
        this.supabase.client
          .from('rosters')
          .select(`
        id,
        team_name,
        owner_id,
        roster_players (
          player_id,
          position
        )
      `)
          .eq('league_id', leagueId)
      ).pipe(
        map(res => {
          if (res.error) throw new Error(res.error.message);
          return res.data.map((roster: any) => ({
            id: roster.id,
            teamName: roster.team_name,
            ownerId: roster.owner_id,
            players: roster.roster_players.map((rp: any) => ({
              playerId: rp.player_id,
              position: rp.position
            }))
          }));
        })
      ));

  }

  canCreateRoster(leagueId: string, userId: string): Observable<boolean> {
    if (!leagueId || leagueId === 'null') {
      return of(false);
    }

    return from(
      this.supabase.client
        .from('rosters')
        .select('id')
        .eq('league_id', leagueId)
        .eq('owner_id', userId)
    ).pipe(
      map(res => {
        if (res.error) throw new Error(res.error.message);
        return res.data.length === 0;
      })
    );
  }

  rosterCreate(leagueId: string, teamName: string, userId: string): Observable<any> {
    if (!leagueId || leagueId === 'null') {
      return of(null);
    }

    return from(
      this.supabase.client
        .from('rosters')
        .insert({
          league_id: leagueId,
          team_name: teamName,
          owner_id: userId
        })
        .select() 
    ).pipe(
      map(res => {
        if (res.error) throw new Error(res.error.message);
        if (!res.data) throw new Error('Roster creation failed');
        return res.data[0];
      })
    );
  }

}

