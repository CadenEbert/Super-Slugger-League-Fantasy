import { Component } from '@angular/core';
import { LeagueCompService } from '../league/league-components/league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  isSettingsOpen = false;
  draftSettings: any[] = ['Snake', 'Standard', 'Auction'];
  players: any[] = [];
  leagueId: string = '';
  rosterLimit: number = 0;

  newDraftSetting: string = '';
  

  constructor(private leagueService: LeagueCompService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.leagueId = this.route.snapshot.paramMap.get('leagueId') || '';

  }

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  updateDraftSettings(newSetting: string) {
    console.log('Updating draft settings...', this.leagueId, newSetting);
    this.leagueService.updateDraftSettings(this.leagueId, newSetting).subscribe({
      next: () => {
        console.log('Draft settings updated successfully');
      },
      error: (error) => {
        console.error('Error updating draft settings:', error);
      }
    });
  }

  deleteLeague() {
    
    this.leagueService.deleteLeague(this.leagueId).subscribe({
      next: () => {
        console.log('League deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting league:', error);
      }
    });

    this.router.navigate(['/']);
  }

  updateRosterLimit(newLimit: number) {
    this.leagueService.updateRosterLimit(this.leagueId, newLimit).subscribe({
      next: () => {
        console.log('Roster limit updated successfully');
      },
      error: (error) => {
        console.error('Error updating roster limit:', error);
      }
    });
  }

  
}
