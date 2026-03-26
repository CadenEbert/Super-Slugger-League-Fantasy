import { Component, Input } from '@angular/core';
import { LeagueService } from '../league-service';


@Component({
  selector: 'app-myleagues',
  standalone: false,
  templateUrl: './myleagues.html',
  styleUrl: './myleagues.css',
})
export class Myleagues {

  constructor(private leagueService: LeagueService) { }
  leagues: any[] = [];



  ngOnInit() {
    this.leagueService.getLeagues().subscribe(leagues => {
      this.leagues = leagues;
      console.log('DATA:', leagues);
    });
  }



  selectLeague(league: any) {
    // Placeholder for selecting a league and navigating to its details page
    console.log('Selected league:', league);
  }


}
