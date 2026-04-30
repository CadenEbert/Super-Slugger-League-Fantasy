import { Component } from '@angular/core';
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

  playerStats: any[] = [];
  user_id: string = '';

  editing: boolean = false;

  allPlayers: any[] = [];
  mvpPlayers: any[] = [];

  selectedPlayer: any = null;



  currentView: 'stats' | 'mvp' = 'stats';


  constructor(private leagueService: LeagueCompService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.leagueService.getPlayerStats(this.route.parent?.snapshot.params['leagueId']).subscribe((stats: any[]) => {

      this.mvpPlayers = this.sortByPoints(stats).slice(0, 10);
      this.user_id = '';
      this.leagueService.getUserIdFromBackend().subscribe({
        next: (userId) => {
          this.user_id = userId;
          this.allPlayerStats = stats.filter(stat => stat.user_id === this.user_id);
          this.leagueService.getFilteredPlayerStats(this.route.parent?.snapshot.params['leagueId'], this.user_id).subscribe((stats: any[]) => {
            this.allPlayers = stats;
            console.log('All player stats:', this.allPlayers);
            this.cdr.detectChanges();
          });
        } 
  


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
    this.allPlayerStats = this.sortByPoints(this.allPlayerStats);
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

sortByPoints(players: any[]) {
  console.log('Sorting players by points:', players);
  return players.sort((a, b) => b.total_points - a.total_points);
}

deletePlayer(characterId: number) {
  console.log('Deleting player with ID:', characterId);
  this.leagueService.deletePlayerStats(this.route.parent?.snapshot.params['leagueId'], this.user_id, characterId).subscribe(() => {
    window.location.reload();
    window.alert('Player stats deleted successfully!');
  });
}


}
