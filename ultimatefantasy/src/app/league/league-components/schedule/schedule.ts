import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeagueService } from '../../league-service.js';
import { LeagueCompService } from '../league-comp-service.js';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';





@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {



  constructor(
    private route: ActivatedRoute,
    
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {


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



  sortByWins(standings: any[]) {
    for (let i = 0; i < standings.length - 1; i++) {
      for (let j = 0; j < standings.length - i - 1; j++) {
        if (standings[j].wins < standings[j + 1].wins) {
          [standings[j], standings[j + 1]] = [standings[j + 1], standings[j]];
        }
      }
    }
    return standings;
  }




  setScheduleGames(games: Game[]) {
    this.scheduleGamesSubject.next(games);
  }

  generateSchedule() {

    this.generating = true;

    this.leagueCompService.generateSchedule(this.route.parent?.snapshot.params['leagueId'], this.totalWeeks, this.number_of_playoffs).subscribe({
      next: (response) => {
        console.log('Generated schedule:', this.scheduleGames$);
        const mapped = response.map((g: any) => ({
          home_team: g.homeTeam,
          away_team: g.awayTeam,
          week: g.week,
          bye: g.bye,

        }));
        this.setScheduleGames(mapped);
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

  completeWeek(game: Game) {
    this.leagueCompService
      .completeWeek(
        this.route.parent?.snapshot.params['leagueId'],
        this.scheduleMetadataSubject.getValue()?.current_week
      )
      .subscribe({
        next: (response) => {
          console.log('Week completed successfully');
          window.location.reload();
        },
        error: (err) => console.error('Error completing week:', err)
      });
  }

  getPlayoffTeams() {
    this.leagueCompService.getPlayoffTeams(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (teams) => {
        console.log('Fetched playoff teams:', teams);
      },
      error: (err) => console.error('Error fetching playoff teams:', err)
    });
  }

  startPlayoffs(finalPlayoffTeams: any[]) {

    this.gen_playoffs = true;

    this.leagueCompService.startPlayoffs(this.route.parent?.snapshot.params['leagueId'], finalPlayoffTeams).subscribe({
      next: (response) => {
        console.log('Playoffs started successfully');
        this.gen_playoffs = false;
        this.cdr.detectChanges();
      }, error: (err) => {
        console.error('Error starting playoffs:', err);
        this.gen_playoffs = false;
      }
    });

  }

  completeRound(playoffGames: Game[]) {
    this.gen_playoffs = true;

    this.leagueCompService.completeRound(this.route.parent?.snapshot.params['leagueId'], playoffGames).subscribe({
      next: (response) => {

        console.log('Round completed successfully');
        this.gen_playoffs = false;
        window.location.reload();
      },
      error: (err) => console.error('Error completing round:', err)
    });

  }
}
