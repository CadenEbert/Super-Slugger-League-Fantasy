import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/auth-service';
import { LeagueCompService } from '../league-comp-service';


@Injectable({
  providedIn: 'root',
})
export class PlayerstatsService {
  public allPlayersStats$ = new BehaviorSubject<any[]>([]);
  public playerStats$ = new BehaviorSubject<any[]>([]);
  public isLoading$ = new BehaviorSubject<boolean>(true);
  public userId$ = new BehaviorSubject<any>('');
  public leagueId$ = new BehaviorSubject<any>('');
  public editing$ = new BehaviorSubject<boolean>(false);
  public allPlayers$ = new BehaviorSubject<any[]>([]);
  public mvpPlayers$ = new BehaviorSubject<any[]>([]);
  public selectedPlayer: any = null;
  public selectedPlayer$ = new BehaviorSubject<any>(null);
  public currentView$ = new BehaviorSubject<string>('stats');


  constructor(private http: HttpClient, private authService: AuthService, private leagueService: LeagueCompService) {
    this.userId$.next(this.authService.getUserId());
  }

  loadPlayerStats(league_id: string) {
    this.setIsLoading(true);
    this.setLeagueId(league_id);

    forkJoin({
      playerStatsCall: this.http.get<any[]>(`/api/leagues/${league_id}/playerstats`),
      filteredPlayersCall: this.http.get<any[]>(`/api/leagues/${league_id}/playerstats/characters`)
    }).subscribe(({ playerStatsCall, filteredPlayersCall }) => {
      this.mvpPlayers$.next(this.sortByPoints(playerStatsCall));
      this.allPlayersStats$.next(playerStatsCall);
      this.allPlayers$.next(filteredPlayersCall);
      this.playerStats$.next(playerStatsCall.filter(stat => stat.user_id === this.userId$.value));
      this.setIsLoading(false);
    })
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
  }

  setLeagueId(leagueId: string) {
    this.leagueId$.next(leagueId);
  }

  sortByPoints(players: any[]) {
    return players.sort((a, b) => b.total_points - a.total_points);
  }

  setAllPlayerStats(playerStats: any[]) {
    this.allPlayersStats$.next(playerStats);
  }

  setAllPlayers(players: any[]) {
    this.allPlayers$.next(players);
  }



  saveStats() {

    this.savePlayerStats(this.leagueId$.value, this.userId$.value, this.playerStats$.value).subscribe(() => {
      alert('Player stats saved successfully!');


    });
  }

  onPlayerChange(player: any) {
    this.selectedPlayer$.next(player);
    this.selectedPlayer = player;
  }

  onViewChange(view: string) {
    this.currentView$.next(view);
    this.setAllPlayerStats(this.sortByPoints(this.allPlayersStats$.value));



  }

  savePlayerStats(leagueId: string, user_id: string, stats: any): Observable<any> {
    return this.http.put(`/api/leagues/${leagueId}/playerstats`, { user_id, stats });
  }

  addPlayer() {
    this.leagueService.addPlayer(this.leagueId$.value, this.userId$.value, this.selectedPlayer$.value).subscribe(() => {
      alert('Player added successfully!');

      globalThis.location.reload();

      this.leagueService.getFilteredPlayerStats(this.leagueId$.value, this.userId$.value).subscribe((stats: any[]) => {
        this.setAllPlayers(stats);

      });
    });
  }



  toggleEdit() {
    if (this.editing$.value == true) {
      this.editing$.next(false);
    } else {
      this.editing$.next(true);
    }
  }

  deletePlayer(characterId: number) {
    this.leagueService.deletePlayerStats(this.leagueId$.value, this.userId$.value, characterId).subscribe(() => {

      alert('Player stats deleted successfully!');
      globalThis.location.reload();
    });
  }

}
