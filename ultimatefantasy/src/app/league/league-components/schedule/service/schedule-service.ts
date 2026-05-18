import { Injectable } from '@angular/core';
import { Game } from '../../../../core/models/schedule.model.js';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, forkJoin } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { LeagueService } from '../../../league-service.js';
import { LeagueCompService } from '../../league-comp-service.js';
import { AuthService } from '../../../../auth/auth-service.js';

@Pipe({ name: 'filterByWeek' })
export class FilterByWeekPipe implements PipeTransform {
  transform(games: any[], week: number | string | null): any[] {
    if (!games) return [];
    if (!week) return games;
    const weekNum = typeof week === 'string' ? parseInt(week, 10) : week;
    return games.filter(game => game.week === weekNum);
  }
}

@Pipe({ name: 'filterPlayoffGames' })
export class FilterPlayoffGamesPipe implements PipeTransform {
  transform(games: any[], current_round: boolean): any[] {
    if (!games) return [];
    return games.filter(game => game.round === current_round);
  }
}

@Pipe({ name: 'createArray' })
export class CreateArrayPipe implements PipeTransform {
  transform(value: number): number[] {
    return Array.from({ length: Number(value) }, (_, i) => i + 1);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {

  private userId = new BehaviorSubject<string>('');
  userId$ = this.userId.asObservable();

  private ownerIdSubject = new BehaviorSubject<string | null>(null);
  ownerId$ = this.ownerIdSubject.asObservable();

  private scheduleSubject = new BehaviorSubject<any>(null);
  schedule$ = this.scheduleSubject.asObservable();

  public canDraft$ = new BehaviorSubject<boolean>(false);
  canDraftObservable$ = this.canDraft$.asObservable();

  private scheduleGamesSubject = new BehaviorSubject<Game[]>([]);
  scheduleGames$: Observable<Game[]> = this.scheduleGamesSubject.pipe(
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );

  private scheduleMetadataSubject = new BehaviorSubject<any>(null);
  scheduleMetadata$ = this.scheduleMetadataSubject.pipe(
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );

  public totalWeeks$ = new BehaviorSubject<number>(0);
  public number_of_playoffs$ = new BehaviorSubject<number>(4);
  public generating$ = new BehaviorSubject<boolean>(false);
  public gen_playoffs$ = new BehaviorSubject<boolean>(false);
  public playoffTeams$ = new BehaviorSubject<any[]>([]);
  public playoffTeamsFinal$ = new BehaviorSubject<any[]>([]);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public playoffGames$ = new BehaviorSubject<Game[]>([]);

  public vm$ = combineLatest([
    this.schedule$,
    this.userId$,
    this.ownerId$,
    this.canDraftObservable$,
    this.scheduleMetadata$,
    this.scheduleGames$,
    this.generating$,
    this.gen_playoffs$,
    this.playoffTeams$,
    this.playoffTeamsFinal$,
    this.totalWeeks$,
    this.number_of_playoffs$,
    this.isLoading$
  ]).pipe(
    map(([schedule, userId, ownerId, canDraft, scheduleMetadata, scheduleGames, generating, gen_playoffs, playoffTeams, playoffTeamsFinal, totalWeeks, number_of_playoffs, isLoading]) => ({
      schedule, userId, ownerId, canDraft, scheduleMetadata, scheduleGames,
      generating, gen_playoffs, playoffTeams, playoffTeamsFinal,
      totalWeeks, number_of_playoffs, isLoading,
      isOwner: scheduleMetadata ? userId === scheduleMetadata.owner_id : false
    }))
  );

  constructor(private leagueService: LeagueService,
    private leagueCompService: LeagueCompService,
    private authService: AuthService
  ) { }

  loadSchedule(league_id: string) {
    this.setLoading(true);
    this.setUserId(this.authService.getUserId());
    this.leagueCompService.joinScheduleChannel(league_id);

    this.leagueService.canDraft(league_id).subscribe({
      next: (canDraft) => this.setCanDraft(canDraft),
      error: (err) => console.error('Error checking canDraft:', err)
    });

    this.leagueCompService.getSchedule(league_id).subscribe({
      next: (schedule: any) => {
        this.scheduleSubject.next(schedule);
        const owner_id = Array.isArray(schedule)
          ? schedule[0]?.owner_id
          : schedule?.owner_id;
        if (owner_id) {
          this.setOwnerId(owner_id);
        }
      },
      error: (err) => console.error('Error fetching schedule:', err)
    });

    this.leagueCompService.getScheduleMetadata(league_id).subscribe({
      next: (metadata) => {
        this.setScheduleMetadata(metadata);
        this.loadGamesByStatus(metadata, league_id);
        this.setLoading(false);
      },
      error: (err) => {
        console.error('Error fetching schedule metadata:', err);
        this.setLoading(false);
      }
    });

    this.leagueCompService.onScheduleUpdate(league_id).subscribe({
      next: (updatedGame) => {
        const current = this.scheduleGamesSubject.getValue();
        const idx = current.findIndex(g => g.id === updatedGame.id);
        if (idx > -1) {
          const updated = [...current];
          updated[idx] = updatedGame;
          this.setScheduleGames(updated);
        } else {
          this.setScheduleGames([...current, updatedGame]);
        }
      },
      error: (err) => console.error('Error on schedule update stream:', err)
    });

    this.leagueCompService.onScheduleMetadataUpdate(league_id).subscribe({
      next: (metadata) => {
        this.setScheduleMetadata(metadata);
        this.loadGamesByStatus(metadata, league_id);
      },
      error: (err) => console.error('Error on metadata update stream:', err)
    });
  }

  private loadGamesByStatus(metadata: any, league_id: string) {
    const status = metadata.status;

    if (status === 'in_progress') {
      this.leagueCompService.getScheduleGames(league_id).subscribe({
        next: (games) => this.setScheduleGames(games),
        error: (err) => console.error('Error fetching schedule games:', err)
      });
    }

    if (status === 'playoffs_not_started') {
      this.number_of_playoffs$.next(metadata.number_of_playoffs || 4);
      this.leagueCompService.updateStandings(league_id).subscribe({
        next: (response) => {
          const teams = Array.isArray(response) ? response : Object.values(response);
          const sorted = [...teams].sort((a: any, b: any) => b.wins - a.wins);
          this.playoffTeams$.next(sorted);
        },
        error: (err) => console.error('Error updating standings:', err)
      });
    }

    if (status === 'playoffs_in_progress' || status === 'playoffs_completed') {
      this.leagueCompService.getPlayoffGames(league_id).subscribe({
        next: (games) => this.setScheduleGames(games),
        error: (err) => console.error('Error fetching playoff games:', err)
      });
    }
  }

  generateSchedule(league_id: string) {
    this.generating$.next(true);

    this.leagueCompService.generateSchedule(league_id, this.totalWeeks$.value, this.number_of_playoffs$.value).subscribe({
      next: (response) => {
        console.log(response);
        const mapped = response.games.map((g: any) => ({
          home_team: g.homeTeam,
          away_team: g.awayTeam,
          week: g.week,
          bye: g.bye,
        }));
        this.setScheduleGames(mapped);
        this.generating$.next(false);
      },
      error: (err) => {
        console.error('Error generating schedule:', err);
        this.generating$.next(false);
      }
    });
  }

  clearSchedule(league_id: string) {
    this.leagueCompService.clearSchedule(league_id).subscribe({
      next: () => this.setScheduleGames([]),
      error: (err) => console.error('Error clearing schedule:', err)
    });
  }

  startSeason(league_id: string) {
    this.leagueCompService.startSeason(league_id).subscribe({
      next: () => console.log('Season started successfully'),
      error: (err) => console.error('Error starting season:', err)
    });
  }



  completeWeek(league_id: string) {
    const current_week = this.scheduleMetadataSubject.getValue()?.current_week;
    this.leagueCompService.completeWeek(league_id, current_week).subscribe({
      next: () => console.log('Week completed successfully'),
      error: (err) => console.error('Error completing week:', err)
    });
  }

  getPlayoffTeams(league_id: string) {
    this.leagueCompService.getPlayoffTeams(league_id).subscribe({
      next: (teams) => this.playoffTeams$.next(teams),
      error: (err) => console.error('Error fetching playoff teams:', err)
    });
  }

  startPlayoffs(league_id: string, finalPlayoffTeams: any[]) {
    this.gen_playoffs$.next(true);
    this.leagueCompService.startPlayoffs(league_id, finalPlayoffTeams).subscribe({
      next: () => this.gen_playoffs$.next(false),
      error: (err) => {
        console.error('Error starting playoffs:', err);
        this.gen_playoffs$.next(false);
      }
    });
  }

  completeRound(league_id: string, playoffGames: Game[]) {
    this.gen_playoffs$.next(true);
    this.leagueCompService.completeRound(league_id, playoffGames).subscribe({
      next: () => {
        console.log('Round completed successfully');
        this.gen_playoffs$.next(false);
      },
      error: (err) => {
        console.error('Error completing round:', err);
        this.gen_playoffs$.next(false);
      }
    });
  }

  setLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
  }

  setOwnerId(ownerId: string) {
    this.ownerIdSubject.next(ownerId);
  }

  setScheduleMetadata(metadata: any) {
    this.scheduleMetadataSubject.next(metadata);
  }

  setUserId(userId: string) {
    this.userId.next(userId);
  }

  setCanDraft(canDraft: boolean) {
    this.canDraft$.next(canDraft);
  }

  setScheduleGames(games: Game[]) {
    this.scheduleGamesSubject.next(games);
  }
}