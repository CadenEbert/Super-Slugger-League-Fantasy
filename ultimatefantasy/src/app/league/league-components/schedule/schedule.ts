import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { BehaviorSubject, map } from 'rxjs';
import { LeagueService } from '../../league-service.js';
import { LeagueCompService } from '../league-comp-service.js';




export interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
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

  private ownerIdSubject = new BehaviorSubject<string>('');
  ownerId$ = this.ownerIdSubject.asObservable();

  private scheduleSubject = new BehaviorSubject<any>(null);
  schedule$ = this.scheduleSubject.asObservable();

  games: any[] = [];

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    
    private leagueCompService: LeagueCompService
  ) {
    const leagueId = this.route.snapshot.paramMap.get('leagueId');

    
  }

  ngOnInit() {

    this.isLoading = true;
    this.setUserId(this.authService.getUserId() ?? '');




    
    
    this.leagueCompService.getSchedule(this.route.parent?.snapshot.params['leagueId']).subscribe((schedule: any) => {
      this.scheduleSubject.next(schedule);
      this.setOwnerId(schedule.owner_id);
      this.isLoading = false;


    });




    
    

  }

  setOwnerId(ownerId: string) {
    this.ownerIdSubject.next(ownerId);
  }
  
  setUserId(userId: string) {
   
    this.userId.next(userId);
  }


}
