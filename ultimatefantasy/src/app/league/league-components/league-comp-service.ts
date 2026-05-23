import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeagueCompService {
  private supabase: SupabaseClient;
  private activeChannels: Map<string, RealtimeChannel> = new Map();

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  getProfile(): Observable<any> {
    return this.http.get('/api/profile');
  }

  getUsersRosterId(leagueId: string, userId: string): Observable<string> {
    return this.http
      .get<{ rosterId: string }>(`/api/leagues/${leagueId}/rosters/user/${userId}`)
      .pipe(map(res => res.rosterId));
  }

  getSchedule(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/schedule`);
  }



  onScheduleUpdate(leagueId: string): Observable<any> {
    return new Observable(observer => {
      const channelKey = `schedule-${leagueId}`;
      if (this.activeChannels.has(channelKey)) {
        this.activeChannels.get(channelKey)!.unsubscribe();
      }

      const channel = this.supabase
        .channel(channelKey)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'schedule_games', filter: `league_id=eq.${leagueId}` },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              observer.next({ deleted: true, id: (payload.old as any).id });
            } else {
              observer.next(payload.new);
            }
          }
        )
        .subscribe();

      this.activeChannels.set(channelKey, channel);

      return () => {
        channel.unsubscribe();
        this.activeChannels.delete(channelKey);
      };
    });
  }

  onScheduleMetadataUpdate(leagueId: string): Observable<any> {
    return new Observable(observer => {
      const channelKey = `schedule-meta-${leagueId}`;
      if (this.activeChannels.has(channelKey)) {
        this.activeChannels.get(channelKey)!.unsubscribe();
      }

      const channel = this.supabase
        .channel(channelKey)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'schedule', filter: `league_id=eq.${leagueId}` },
          (payload) => observer.next(payload.new)
        )
        .subscribe();

      this.activeChannels.set(channelKey, channel);

      return () => {
        channel.unsubscribe();
        this.activeChannels.delete(channelKey);
      };
    });
  }

  getScheduleMetadata(leagueId: string): Observable<any> {
    return this.http.get<any>(`/api/leagues/${leagueId}/schedule/metadata`);
  }

  getScheduleGames(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/schedule/games`);
  }

  startSeason(leagueId: string): Observable<any> {
    return this.http.put(`/api/leagues/${leagueId}/schedule/start`, {});
  }

  generateSchedule(leagueId: string, total_weeks: number, number_in_playoffs: number): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/schedule`, { total_weeks, number_in_playoffs });
  }

  updateGame(leagueId: string, gameId: string, updatedData: any): Observable<any> {
    return this.http.put(`/api/leagues/${leagueId}/schedule/game/${gameId}`, updatedData);
  }

  clearSchedule(leagueId: string): Observable<any> {
    return this.http.delete(`/api/leagues/${leagueId}/schedule`);
  }

  completeWeek(league_id: string, week_number: number): Observable<any> {
    return this.http.put(`/api/leagues/${league_id}/week/${week_number}`, {});
  }

  getAllPlayers(leagueId: string, rosterId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/rosters/${rosterId}`);
  }

  getPlayoffTeams(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/playoffs/teams`);
  }

  updateStandings(leagueId: string): Observable<any> {
    return this.http.put(`/api/leagues/${leagueId}/standings/update`, {});
  }

  getDraftStatus(leagueId: string): Observable<string> {
    return this.http.get<{ draftStatus: string }>(`/api/draft/${leagueId}/status`).pipe(
      map(res => res.draftStatus)
    );
  }

  completeRound(leagueId: string, games: any[]): Observable<any> {
    return this.http.put(`/api/leagues/${leagueId}/round/complete`, { games });
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
    if (!leagueId || leagueId === 'null') return of(false);
    return this.http.get<{ canCreate: boolean }>(
      `/api/leagues/${leagueId}/rosters/can-create?userId=${userId}`
    ).pipe(map(res => res.canCreate));
  }

  rosterCreate(leagueId: string, teamName: string, teamImage: string, userId: string, userName: string | null): Observable<any> {
    if (!leagueId || leagueId === 'null') return of(null);
    return this.http.post<any>(`/api/leagues/${leagueId}/rosters`, { teamName, userId, teamImage, userName });
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
    return this.http.post(`/api/leagues/${leagueId}/rosters/${rosterId}/players/${characterId}/batting-order`, { newBattingOrder: newOrder });
  }

  deleteLeague(leagueId: string): Observable<any> {
    return this.http.delete(`/api/leagues/${leagueId}`);
  }

  getAllMembers(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/members`);
  }

  updateDraftSettings(leagueId: string, newSetting: string): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/draft-settings`, { draftSettings: newSetting });
  }

  updateRosterLimit(leagueId: string, newLimit: number): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/roster-limit`, { rosterLimit: newLimit });
  }

  startPlayoffs(leagueId: string, playoffTeams: any[]): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/playoffs/start`, { playoffTeams });
  }

  getPlayoffGames(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/playoffs/games`);
  }

  getPlayerStats(leagueId: string): Observable<any> {
    return this.http.get<any>(`/api/leagues/${leagueId}/playerstats`);
  }

  getFilteredPlayerStats(leagueId: string, user_id: string): Observable<any> {
    return this.http.get<any>(`/api/leagues/${leagueId}/playerstats/characters`, { params: { user_id } });
  }

  addPlayer(leagueId: string, user_id: string, selectedPlayer: any): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/playerstats/add`, { user_id, selectedPlayer });
  }

  addPlayerStats(leagueId: string, user_id: string, stats: any): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/playerstats`, { user_id, stats });
  }

  savePlayerStats(leagueId: string, user_id: string, stats: any): Observable<any> {
    return this.http.put(`/api/leagues/${leagueId}/playerstats`, { user_id, stats });
  }

  updatePlayerStats(leagueId: string, user_id: string, stats: any): Observable<any> {
    return this.http.put(`/api/leagues/${leagueId}/playerstats`, { user_id, stats });
  }

  deletePlayerStats(leagueId: string, user_id: string, characterId: number): Observable<any> {
    return this.http.delete(`/api/leagues/${leagueId}/playerstats/delete`, {
      params: { user_id, characterId: characterId.toString() }
    });
  }

  getTrades(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/trades`);
  }

  getAllCharacters(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/trades/characters`);
  }

  getAllTradeMembers(leagueId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/leagues/${leagueId}/trades/rosters`);
  }

  getAllCharacterNames(): Observable<any[]> {
    return this.http.get<any[]>(`/api/trades/characters/names`);
  }

  proposeTrade(leagueId: string, tradeData: any): Observable<any> {
    return this.http.post(`/api/leagues/${leagueId}/trades`, tradeData);
  }

  acceptTrade(tradeId: string): Observable<any> {
    return this.http.put(`/api/trades/${tradeId}/accept`, {});
  }

  rejectTrade(tradeId: string): Observable<any> {
    return this.http.put(`/api/trades/${tradeId}/reject`, {});
  }

  getUserIdFromBackend(): Observable<string> {
    return this.http.get<{ user_id: string }>('/api/user-id').pipe(map(res => res.user_id));
  }

  getRosterForUpdate(leagueId: string, rosterId: string): Observable<any> {
    return this.http.get<any>(`/api/leagues/${leagueId}/rosters/${rosterId}/update-roster`);
  }

  updateRosterDetails(leagueId: string, rosterId: string, teamName: string, teamImage: string): Observable<any> {
    return this.http.put(`/api/leagues/${leagueId}/rosters/${rosterId}/details`, { teamName, teamImage });
  }
}