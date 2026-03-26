import { Component, ChangeDetectorRef } from '@angular/core';
import { LeagueService } from '../league-service';

@Component({
  selector: 'app-myleagues',
  standalone: false,
  templateUrl: './myleagues.html',
  styleUrl: './myleagues.css',
})
export class Myleagues {
  leagues: any[] = [];

  constructor(
    private leagueService: LeagueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.leagueService.getLeaguesForCurrentUser().subscribe(leagues => {
      this.leagues = leagues;
      console.log('DATA:', leagues);
      this.cdr.detectChanges();  
    });
  }

  selectLeague(league: any) {
    console.log('Selected league:', league);
  }
}