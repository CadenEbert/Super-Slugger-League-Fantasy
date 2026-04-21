import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { BehaviorSubject, combineLatest, distinct, distinctUntilChanged, map, Observable } from 'rxjs';
import { LeagueService } from '../../league-service.js';
import { LeagueCompService } from '../league-comp-service.js';


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
}
export interface Schedule {
  leagueId: string;
  owner_id: string;
  current_week: number;
  total_weeks: number;
  status: string;
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
    private leagueCompService: LeagueCompService
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

    this.leagueCompService.generateSchedule(this.route.parent?.snapshot.params['leagueId'], this.totalWeeks, this.number_of_playoffs).subscribe({
      next: (response) => {
        this.setScheduleGames(Array.isArray(response) ? response : response.games ?? []);
        console.log('Generated schedule:', this.scheduleGames$);
      },
      error: (err) => console.error('Error generating schedule:', err)
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

}
