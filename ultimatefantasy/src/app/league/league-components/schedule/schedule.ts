import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Game } from '../../../core/models/schedule.model';
import { ScheduleService } from './service/schedule-service';





@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {
  selectedWeek = 1;
  private weeksSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    public scheduleService: ScheduleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.weeksSubscription = this.scheduleService.weeks$.subscribe(weeks => {
      if (weeks.length > 0) {
        this.selectedWeek = weeks[weeks.length - 1];
      }
    });

    this.scheduleService.loadSchedule(this.route.parent?.snapshot.params['leagueId']);
  }

  ngOnDestroy() {
    this.weeksSubscription?.unsubscribe();
  }
  get weeks$() {
    return this.scheduleService.weeks$;
  }

  get leagueId() {
    return this.route.parent?.snapshot.params['leagueId'];
  }

  updateGame(game: Game) {


    this.router.navigate([`/league-page/${this.leagueId}/update-schedule`], { state: { game } });
  }

  setTotalWeeks(val: number) {
    this.scheduleService.totalWeeks$.next(val);
  }

  setNumberOfPlayoffs(val: number) {
    this.scheduleService.number_of_playoffs$.next(val);
  }

  setPlayoffTeamAtIndex(index: number, team: any) {
    const current = [...this.scheduleService.playoffTeamsFinal$.getValue()];
    current[index] = team;
    this.scheduleService.playoffTeamsFinal$.next(current);
  }
}
