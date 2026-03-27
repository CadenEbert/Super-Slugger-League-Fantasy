
import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, filter, take, tap, of, pipe } from 'rxjs';
import { SupabaseService } from '../core/supabase';
import { AuthService } from '../core/auth.service';

@Injectable({ providedIn: 'root' })
export class LeagueService {

  constructor(private supabase: SupabaseService, private authService: AuthService) { }

  getLeaguesForCurrentUser(): Observable<any[]> {
    return this.authService.user$.pipe(
      filter(user => user !== null),
      take(1),
      switchMap(user =>
        from(
          this.supabase.client
            .from('league_members')
            .select(`
            role,
            leagues (
              id,
              name,
              created_at
            )
          `)
            .eq('user_id', user!.id)
        ).pipe(
          tap(res => console.log('📦 response:', res)),
          switchMap(res => {
            const rows = res.data as any[];
            const leagues = rows?.map(row => ({
              ...row.leagues,
              myRole: row.role
            })) || [];

            if (leagues.length === 0) return of([]);


            return from(
              this.supabase.client
                .from('league_members')
                .select('league_id')
                .in('league_id', leagues.map(l => l.id))
            ).pipe(
              map(countRes => {
                const members = countRes.data as any[];
                return leagues.map(league => ({
                  ...league,
                  memberCount: members.filter(m => m.league_id === league.id).length
                }));
              })
            );
          })
        )
      )
    );
  }




  createLeague(leagueData: {
    leagueName?: string | null;
    leagueDescription?: string | null;
    leagueSize?: number | null;
    draftSettings?: string | null;
  }): Observable<any> {
    return this.authService.user$.pipe(
      filter(user => user !== null),
      take(1),
      switchMap(user =>
        from(
          this.supabase.client
            .from('leagues')
            .insert({
              name: leagueData.leagueName,
              description: leagueData.leagueDescription,
              size: leagueData.leagueSize,
              draft_settings: leagueData.draftSettings,
              owner_id: user!.id
            })
            .select()
        ).pipe(
          switchMap(res => {
            const league = res.data?.[0];
            if (!league) throw new Error('League creation failed');


            return from(
              this.supabase.client
                .from('league_members')
                .insert({
                  league_id: league.id,
                  user_id: user!.id,
                  role: 'owner'
                })
            ).pipe(
              map(() => league)
            );
          })
        )
      )
    );
  }

  fetchLeagueDetails(leagueId: string): Observable<any> {
  return from(
    this.supabase.client
      .from('leagues')
      .select(`
        id,
        name,
        description,
        size,
        draft_settings,
        league_members (
          user_id,
          role
        )
      `)
      .eq('id', leagueId)
      .single()
  ).pipe(
    map(res => {
      if (res.error) throw new Error(res.error.message);
      const league = res.data;
      return {
        id: league.id,
        name: league.name,
        description: league.description,
        size: league.size,
        draftSettings: league.draft_settings,
        members: league.league_members.map((m: any) => ({
          userId: m.user_id,
          role: m.role,
        }))
      };
    })
  );
}


}