import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LeagueCompService } from '../../league-comp-service.js';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-update-schedule',
  standalone: false,
  templateUrl: './update-schedule.html',
  styleUrl: './update-schedule.css',
})
export class UpdateSchedule {
  members: any[] = [];
  isLoading: boolean = true;
  players: any[] = [];


  game: any;
  stadiums: string[] = ['Mario Stadium'];

  constructor(private router: Router, private activeroute: ActivatedRoute, private leagueService: LeagueCompService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.game = history.state.game;

    forkJoin({
      members: this.leagueService.getAllMembers(this.activeroute.parent?.snapshot.params['leagueId']),
      players: this.leagueService.getAllPlayersByLeagueId(this.activeroute.parent?.snapshot.params['leagueId'])
    }).subscribe(({ members, players }) => {
      this.members = members;
      this.players = players;
      this.isLoading = false;
      this.cdr.detectChanges();
      console.log(players);

    })


  }

  onHomeTeamChange(username: string) {
    const member = this.members.find(m => m.profiles.username === username);
    this.game.home_team_uuid = member.user_id;
    console.log('Selected home team:', username, 'with UUID:', this.game.home_team_uuid);

  }

  onAwayTeamChange(teamName: string) {
    const member = this.members.find(m => m.team_name === teamName);
    this.game.away_team_uuid = member.user_id;
    console.log('Selected away team:', teamName, 'with UUID:', this.game.away_team_uuid);
  }

  getHomeRoster() {
    return this.players.find(p => p.owner_id === this.game.home_team_uuid);
  }

  getAwayRoster() {
    return this.players.find(p => p.owner_id === this.game.away_team_uuid);
  }


  updateGame() {
    this.leagueService.updateGame(this.activeroute.parent?.snapshot.params['leagueId'], this.game.id, this.game).subscribe({

      next: (updatedGame) => {
        console.log('Game updated:', updatedGame);
        this.router.navigate(['../schedule'], { relativeTo: this.activeroute });
      },
      error: (error) => {
        console.error('Error updating game:', error);
      }
    });
  }
}
