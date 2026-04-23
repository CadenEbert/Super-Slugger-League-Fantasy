import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { BehaviorSubject, combineLatest, distinct, distinctUntilChanged, map, Observable } from 'rxjs';
import { LeagueService } from '../../league-service.js';
import { LeagueCompService } from '../league-comp-service.js';
import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';



export interface Game {
  id: number;
  home_team: string;
  away_team: string | null;
  home_score: number | null;
  away_score: number | null;
  week: number;
  bye: boolean;
  playoff_game: boolean;
  league_id: string;
  created_at: string;
  home_team_uuid: string | null;
  away_team_uuid: string | null;
}
export interface Schedule {
  leagueId: string;
  owner_id: string;
  current_week: number;
  total_weeks: number;
  status: string;
}

@Pipe({ name: 'filterByWeek' })
export class FilterByWeekPipe implements PipeTransform {
  transform(games: any[], week: number | string | null): any[] {
    if (!games) return [];
    if (!week) return games;
    const weekNum = typeof week === 'string' ? parseInt(week, 10) : week;
    return games.filter(game => game.week === weekNum);
  }
}

@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {

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


  totalWeeks: number = 0;
  number_of_playoffs: number = 0;

  generating: boolean = false;

  gen_playoffs: boolean = false;

  playoffTeams: any[] = [];

  isLoading: boolean = false;

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

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private leagueService: LeagueService,
    private leagueCompService: LeagueCompService,
    private router: Router
  ) {


  }

  ngOnInit() {

    this.isLoading = true;

    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.setUserId(user.id);
      }
    });

    this.leagueCompService.joinScheduleChannel(this.route.parent?.snapshot.params['leagueId'] || '');

    this.leagueService.canDraft(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (canDraft) => {
        console.log('Can draft:', canDraft);
        this.setCanDraft(canDraft);
        console.log('Can draft (BehaviorSubject):', this.canDraft$.value);
      },
      error: (err) => console.error('Error checking draft eligibility:', err)
    });

    this.leagueCompService.onScheduleUpdate(this.route.parent?.snapshot.params['leagueId'] || '').subscribe({
      next: (game) => {
        console.log('Received schedule game update:', game);

      
        const currentGames = this.scheduleGamesSubject.getValue();
        const existingIndex = currentGames.findIndex(g => g.id === game.id);

        if (existingIndex > -1) {
        
          const updated = [...currentGames];
          updated[existingIndex] = game;
          this.setScheduleGames(updated);
        } else {
       
          this.setScheduleGames([...currentGames, game]);
        }
      },
      error: (err) => console.error('Error receiving schedule update:', err)
    });

    this.leagueCompService.onScheduleMetadataUpdate(this.route.parent?.snapshot.params['leagueId'] || '').subscribe({
      next: (metadata) => {
        console.log('Received schedule metadata update:', metadata);
        this.setScheduleMetadata(metadata);
      },
      error: (err) => console.error('Error receiving schedule metadata update:', err)
    });

    this.leagueCompService.getScheduleMetadata(this.route.parent?.snapshot.params['leagueId'] || '').subscribe({
      next: (metadata) => {
        console.log('Fetched schedule metadata:', metadata);
        this.setScheduleMetadata(metadata);
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

  get isOwner(): boolean {
    return this.userId.getValue() === this.ownerIdSubject.getValue();
  }

  setScheduleMetadata(metadata: any) {
    this.scheduleMetadataSubject.next(metadata);
  }

  setOwnerId(ownerId: string) {
    this.ownerIdSubject.next(ownerId);
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

  generateSchedule(totalWeeks: number, number_of_playoffs: number) {

    this.generating = true;

    this.leagueCompService.generateSchedule(this.route.parent?.snapshot.params['leagueId'], this.totalWeeks, this.number_of_playoffs).subscribe({
      next: (response) => {
        console.log('Generated schedule:', this.scheduleGames$);
        this.generating = false;
      },
      error: (err) => {
        console.error('Error generating schedule:', err);
        this.generating = false;
      }

    });

  }

  clearSchedule() {
    this.leagueCompService.clearSchedule(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (response) => {
        this.setScheduleGames([]);
        console.log('Schedule cleared successfully');
      },
      error: (err) => console.error('Error clearing schedule:', err)
    });
  }

  startSeason() {
    this.leagueCompService.startSeason(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (response) => {
        console.log('Season started successfully');
      },
      error: (err) => console.error('Error starting season:', err)
    });
  }

  updateGame(game: Game) {
    this.router.navigate([`/league-page/${this.route.parent?.snapshot.params['leagueId']}/update-schedule`], { state: { game } });

  }

  completeWeek(game: Game) { {
    

    this.leagueCompService.completeWeek(this.route.parent?.snapshot.params['leagueId'], this.scheduleMetadataSubject.getValue()?.current_week).subscribe({
      next: (response) => {
        console.log('Week completed successfully');
      },
      error: (err) => console.error('Error completing week:', err)
    });
    window.location.reload();
    

    }

  }

  getPlayoffTeams() {
    this.leagueCompService.getPlayoffTeams(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (teams) => {
        console.log('Fetched playoff teams:', teams);
      },
      error: (err) => console.error('Error fetching playoff teams:', err)
    });
  }

  startPlayoffs() {
    console.log('Starting playoffs for league:', this.route.parent?.snapshot.params['leagueId']);
    this.gen_playoffs = true;
    this.gen_playoffs = false;
  }
}
