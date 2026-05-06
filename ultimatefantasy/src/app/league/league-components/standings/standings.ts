import { Component } from '@angular/core';
import { StandingsService } from './service/standings-service';
import { ActivatedRoute } from '@angular/router';





@Component({
  selector: 'app-standings',
  standalone: false,
  templateUrl: './standings.html',
  styleUrl: './standings.css',
})
export class Standings {

  constructor(public standingsService: StandingsService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.standingsService.loadStandings(this.route.parent?.snapshot.params['leagueId']);
  }
}
