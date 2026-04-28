import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth.service.js';
import { LeagueCompService } from '../league-comp-service.js';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';



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

  editing: boolean = false;

  allPlayers: any[] = [];

  selectedPlayer: any = null;



  currentView: 'stats' | 'mvp' = 'stats';


  constructor(private authService: AuthService, private leagueService: LeagueCompService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {

   }

   ngOnInit(): void {
    this.isLoading = true;
    this.leagueService.getPlayerStats(this.route.parent?.snapshot.params['leagueId']).subscribe((stats: any[]) => {
      this.allPlayerStats = stats;
      this.user_id = this.authService.getUserId() ?? '';
      this.leagueService.getFilteredPlayerStats(this.route.parent?.snapshot.params['leagueId'], this.user_id).subscribe((stats: any[]) => {
        this.allPlayers = stats;
        console.log('All player stats:', this.allPlayers);
        this.cdr.detectChanges();
     
  
      });
      this.playerStats = this.allPlayerStats.filter(stat => stat.user_id === this.user_id);
      console.log('Player stats for user:', this.playerStats);
      this.isLoading = false;
    });

  }

  saveStats() {
    console.log('Saving stats for user ID:', this.user_id);
    console.log('Current player stats being saved:', this.playerStats);
    this.leagueService.savePlayerStats(this.route.parent?.snapshot.params['leagueId'], this.user_id, this.playerStats).subscribe(() => {
      window.alert('Player stats saved successfully!');
      this.cdr.detectChanges();
    });
  }

  addPlayer() {
    console.log('Adding player with ID:', this.selectedPlayer?.ID);
    this.leagueService.addPlayer(this.route.parent?.snapshot.params['leagueId'], this.user_id, this.selectedPlayer).subscribe(() => {
      window.location.reload();
      window.alert('Player added successfully!');
   
    

    });

      this.leagueService.getFilteredPlayerStats(this.route.parent?.snapshot.params['leagueId'], this.user_id).subscribe((stats: any[]) => {
        this.allPlayers = stats;
        console.log('Updated player stats after adding player:', this.allPlayers);
        this.cdr.detectChanges();
      });

  }

  toggleEdit() {
    if (this.editing == true) {
      this.editing = false;
    } else {
      this.editing = true;
    }
  }


}
