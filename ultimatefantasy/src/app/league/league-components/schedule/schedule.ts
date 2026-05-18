import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Game } from '../../../core/models/schedule.model';
import { ScheduleService } from './service/schedule-service';





@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {
  constructor(
    private route: ActivatedRoute,
    public scheduleService: ScheduleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.scheduleService.loadSchedule(this.route.parent?.snapshot.params['leagueId']);
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
