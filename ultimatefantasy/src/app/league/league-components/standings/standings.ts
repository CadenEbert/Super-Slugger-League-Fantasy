import { Component } from '@angular/core';
import { LeagueCompService } from '../league-comp-service.js';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';



export interface Standing {
 
  wins: number;
  losses: number;
  username: string;
  team_image: string;
}


@Component({
  selector: 'app-standings',
  standalone: false,
  templateUrl: './standings.html',
  styleUrl: './standings.css',
})
export class Standings {
  standings: any[] = [];
  isLoading: boolean = true;

  constructor(private leagueService: LeagueCompService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    
    this.leagueService.updateStandings(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (data) => {
        this.standings = Object.values(data);
        this.standings = this.sortByWins(this.standings);
        console.log('Fetched standings:', this.standings);
        this.isLoading = false;
        this.cdr.detectChanges();
        
      },
      error: (error) => {
        console.error('Error fetching standings:', error);
      }
    });
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

  positive(team: any) {
    return team.wins > team.losses;
  }




}
