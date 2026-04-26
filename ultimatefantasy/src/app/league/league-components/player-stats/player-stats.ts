import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth.service.js';
import { LeagueCompService } from '../league-comp-service.js';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-player-stats',
  standalone: false,
  templateUrl: './player-stats.html',
  styleUrl: './player-stats.css',
})
export class PlayerStats {
  isLoading: boolean = false;
  allPlayerStats: any[] = [];

  playerStats: any[] = null;
  user_id: string = '';

  currentView: 'stats' | 'mvp' = 'stats';


  constructor(private authService: AuthService, private leagueService: LeagueCompService, private route: ActivatedRoute) {

   }

   ngOnInit(): void {
    this.isLoading = true;
    this.leagueService.getPlayerStats(this.route.parent?.snapshot.params['leagueId']).subscribe((stats: any[]) => {
      this.allPlayerStats = stats;
      this.user_id = this.authService.getUserId() ?? '';
      this.playerStats = this.allPlayerStats.filter(stat => stat.user_id === this.user_id);
      console.log('Player stats for user:', this.playerStats);
      this.isLoading = false;
    });
   

    }

}
