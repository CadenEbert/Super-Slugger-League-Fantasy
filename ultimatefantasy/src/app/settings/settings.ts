import { Component } from '@angular/core';
import { LeagueCompService } from '../league/league-components/league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ObjectEncodingOptions } from 'fs';

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
  protectionLimit: number = 0;
  newDraftSetting: string = '';
  deleting$ = new BehaviorSubject<boolean>(false);
  reseting: boolean = false;


  constructor(private leagueService: LeagueCompService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.leagueId = this.route.snapshot.paramMap.get('leagueId') || '';

  }

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  updateDraftSettings(newSetting: string) {
    this.reseting = true;
    console.log('Updating draft settings...', this.leagueId, newSetting);
    this.leagueService.updateDraftSettings(this.leagueId, newSetting).subscribe({
      next: () => {
        this.reseting = false;
        console.log('Draft settings updated successfully');
      },
      error: (error) => {
        this.reseting = false;
        console.error('Error updating draft settings:', error);
      }
    });
  }

  toggleDelete() {
    if (this.deleting$.value === true) {
      this.deleting$.next(false);
    } else {
      this.deleting$.next(true);
    }

  }

  deleteLeague() {
    this.reseting = true;
    console.log('Deleting league...', this.leagueId);

    this.leagueService.deleteLeague(this.leagueId).subscribe({
      next: () => {
        console.log('League deleted successfully');
        this.reseting = false;
      },
      error: (error) => {
        console.error('Error deleting league:', error);
        this.reseting = false;
      }
    });

    this.router.navigate(['/']);
  }


    resetLeague() {
      this.reseting = true;

    this.leagueService.resetLeague(this.leagueId).subscribe({
      next: () => {
        console.log('League reset successfully');
        alert('League reset successfully');
        this.reseting = false;
        window.location.reload();
      },
      error: (error) => {
        console.error('Error deleting league:', error);
        this.reseting = false;
      }
    });


  }

  updateRosterLimit(newLimit: number) {
    this.reseting = true;
    if (newLimit < 9) {
      this.reseting = false;
      return alert('Cant have less than 9 players');
    }

    if (!Number.isInteger(newLimit)) {
      this.reseting = false;
      return alert('Please enter a whole number');
    }

    if (newLimit > 11) {
      this.reseting = false;
      return alert('Cant have more than 11 players');
    }

    this.leagueService.updateRosterLimit(this.leagueId, newLimit).subscribe({
      next: () => {
        this.reseting = false;
        console.log('Roster limit updated successfully');
        alert('Roster limit updated successfully');
      },
      error: (error) => {
        this.reseting = false;
        console.error('Error updating roster limit:', error);
        alert('Error updating roster limit');
      }
    });
  }

  updateProtectionLimit(newLimit: number) {
    this.reseting = true;
    if (newLimit < 0) {
      this.reseting = false;
      return alert('No Negative Numbers');
    }

    if (!Number.isInteger(newLimit)) {
      this.reseting = false;
      return alert('Please enter a whole number');
    }

    if (newLimit > 11) {
      this.reseting = false;
      return alert('Too Many Protections');
    }
    this.leagueService.updateProtctionLimit(this.leagueId, newLimit).subscribe({
      next: () => {
        this.reseting = false;
        console.log('Protection limit updated successfully');
        alert('Protections updated successfully');
      },
      error: (error) => {
        this.reseting = false;
        console.error('Error updating roster limit:', error);
        alert('Protections update failed');
      }
    });
  }


}
