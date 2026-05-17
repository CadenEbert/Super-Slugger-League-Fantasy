import { Injectable } from '@angular/core';
import { Game, ScheduleObj } from '../../../../core/models/schedule.model.js';
import { BehaviorSubject, combineLatest, distinct, distinctUntilChanged, map, Observable, forkJoin } from 'rxjs';
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
  private totalWeeks$ = new BehaviorSubject<number>(0);
  private number_of_playoffs$ = new  BehaviorSubject<number>(4);
  private generating$ = new BehaviorSubject<boolean>(false);
  private gen_playoffs$ = new BehaviorSubject<boolean>(false);

  private playoffTeams$ = new BehaviorSubject<any[]>([]);
  private playoffTeamsFinal$ = new BehaviorSubject<any[]>([]);

  private isLoading$ = new BehaviorSubject<boolean>(false);

  private playoffGames$ = new BehaviorSubject<Game[]>([]);



  public vm$ = combineLatest([
    this.schedule$,
    this.userId$,
    this.ownerId$,
    this.canDraftObservable$,
    this.scheduleMetadata$,
    this.scheduleGames$
  ]).pipe(
    map(([schedule, userId, ownerId, canDraft, scheduleMetadata, scheduleGames]) => ({
      schedule,
      userId,
      ownerId,
      canDraft,
      scheduleMetadata,
      scheduleGames,
      isOwner: scheduleMetadata ? userId === scheduleMetadata.owner_id : false
    }))
  );

  constructor(private leagueService: LeagueService,
    private leagueCompService: LeagueCompService,
    private authService: AuthService
  ) {}

  loadSchedule(league_id: string) {
    this.setLoading(true);
    this.setUserId(this.authService.getUserId());
    this.leagueCompService.joinScheduleChannel(league_id);


    forkJoin({
      canDraft: this.leagueService.canDraft(league_id),
      scheduleUpdate: this.leagueCompService.onScheduleUpdate(league_id),
      scheduleMetaData: this.leagueCompService.getScheduleMetadata(league_id),
      scheduleMetaDataUpdate: this.leagueCompService.onScheduleMetadataUpdate(league_id)

    }).subscribe(({ canDraft, scheduleUpdate, scheduleMetaData, scheduleMetaDataUpdate }) => {
      this.setCanDraft(canDraft);
      const currentGames = this.scheduleGamesSubject.getValue();
      const existingIndex = currentGames.findIndex(g => g.id === scheduleUpdate.id);
      if (existingIndex > -1) {

        const updated = [...currentGames];
        updated[existingIndex] = scheduleUpdate;
        this.setScheduleGames(updated);
      } else {

        this.setScheduleGames([...currentGames, scheduleUpdate]);
      }

      this.setScheduleMetadata(scheduleMetaData);
      this.setScheduleMetadata(scheduleMetaDataUpdate);
      



        }
    )

  }


    this.leagueCompService.getScheduleMetadata(this.route.parent?.snapshot.params['leagueId'] || '').subscribe({
      next: (metadata) => {
        console.log('Fetched schedule metadata:', metadata);
        this.setScheduleMetadata(metadata);

        if (metadata.status === 'in_progress') {
          this.leagueCompService.getScheduleGames(this.route.parent?.snapshot.params['leagueId'] || '').subscribe({
            next: (games) => {
              console.log('Fetched schedule games:', games);
              this.setScheduleGames(games);
            },
            error: (err) => console.error('Error fetching schedule games:', err)
          });

        }

        if (metadata.status === 'playoffs_not_started') {
          this.number_of_playoffs = metadata.number_of_playoffs || 4;
          this.leagueCompService.updateStandings(this.route.parent?.snapshot.params['leagueId'] || '').subscribe({
            next: (response) => {
              console.log('Standings updated successfully');
              this.playoffTeams = Array.isArray(response) ? response : Object.values(response);
              this.playoffTeams = this.sortByWins(this.playoffTeams);
              console.log('Fetched playoff teams after standings update:', this.playoffTeams);
              this.cdr.detectChanges();
            },
            error: (err) => console.error('Error updating standings:', err)
          });
        }

        if (metadata.status === 'playoffs_in_progress' || metadata.status === 'playoffs_completed') {
          this.leagueCompService.getPlayoffGames(this.route.parent?.snapshot.params['leagueId'] || '').subscribe({
            next: (games) => {
              console.log('Fetched playoff games:', games);
              this.setScheduleGames(games);
              this.cdr.detectChanges();
            }
          });
        }


      },
      error: (err) => console.error('Error fetching schedule metadata:', err)
    });

    this.leagueCompService.getScheduleGames(this.route.parent?.snapshot.params['leagueId'] || '').subscribe({
      next: (games) => {
        console.log('Fetched schedule games:', games);
        this.setScheduleGames(games);
      },
      error: (err) => console.error('Error fetching schedule games:', err)
    });



    this.leagueCompService.getSchedule(this.route.parent?.snapshot.params['leagueId']).subscribe((schedule: any) => {
      this.scheduleSubject.next(schedule);
      this.setOwnerId(schedule.owner_id);
      this.isLoading = false;


    });







  }

  setLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
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
