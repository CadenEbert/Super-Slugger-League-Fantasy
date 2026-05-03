import { Component } from '@angular/core';
import { PlayerstatsService } from '../services/playerstats-service';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-player-stats',
  standalone: false,
  templateUrl: './player-stats.html',
  styleUrl: './player-stats.css',
})
export class PlayerStats {

  constructor(public playerstatsService: PlayerstatsService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.playerstatsService.loadPlayerStats(this.route.parent?.snapshot.params['leagueId']);
  }
}
