import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { BehaviorSubject, map } from 'rxjs';
import { LeagueService } from '../../league-service.js';
import { LeagueCompService } from '../league-comp-service.js';


export interface Game {
  homeTeam: string;
  awayTeam: string;
  week: number;
  bye: boolean;
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

  games: any[] = [];

  totalWeeks: number = 0;
  number_of_playoffs: number = 0;

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private leagueService: LeagueService,
    private leagueCompService: LeagueCompService
  ) {
    const leagueId = this.route.snapshot.paramMap.get('leagueId');


  }

  ngOnInit() {

    this.isLoading = true;

    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.setUserId(user.id);
      }
    });

        this.leagueService.canDraft(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (canDraft) => {
        console.log('Can draft:', canDraft);
        this.setCanDraft(canDraft);
        console.log('Can draft (BehaviorSubject):', this.canDraft$.value);
      },
      error: (err) => console.error('Error checking draft eligibility:', err)
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

  setOwnerId(ownerId: string) {
    this.ownerIdSubject.next(ownerId);
  }

  setUserId(userId: string) {

    this.userId.next(userId);
  }

  setCanDraft(canDraft: boolean) {
    this.canDraft$.next(canDraft);
  }

  generateSchedule(totalWeeks: number, number_of_playoffs: number) {
    
    this.leagueCompService.generateSchedule(this.route.parent?.snapshot.params['leagueId'], this.totalWeeks, this.number_of_playoffs).subscribe({
      next: (response) => {
        this.games = response.schedule;
        console.log('Generated schedule:', this.games);
      },
      error: (err) => console.error('Error generating schedule:', err)
    });

  }

}
