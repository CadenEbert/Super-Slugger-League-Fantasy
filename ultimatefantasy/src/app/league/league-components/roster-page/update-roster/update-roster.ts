import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeagueCompService } from '../../league-comp-service.js';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-update-roster',
  standalone: false,
  templateUrl: './update-roster.html',
  styleUrl: './update-roster.css',
})
export class UpdateRoster {

  isLoading: boolean = true;


  teamPictures: { [key: string]: string } = {
    'Birdo Bows': 'BirdoBows-MSS.png',
    'Bowser Jr. Rookies': 'BowserJrRookies-MSS.png',
    'Bowser Monsters': 'BowserMonsters-MSS.png',
    'Daisy Flowers': 'DaisyFlowers-MSS.png',
    'Diddy Monkeys': 'DiddyMonkeys-MSS.png',
    'DK Wilds': 'DKWilds-MSS.png',
    'Luigi Knights': 'LuigiKnights-MSS.png',
    'Mario Fireballs': 'MarioFireballs-MSS.png',
    'Peach Monarchs': 'PeachMonarchs-MSS.png',
    'WaluigiSpitballs': 'WaluigiSpitballs-MSS.png',
    'Wario Muscles': 'WarioMuscles-MSS.png',
    'Yoshi Eggs': 'YoshiEggs-MSS.png'
  };

  selectedTeamPicture: string = '';
  newName: string = '';
  newPicture: string = '';

  roster: any[] = [];

  constructor(private leagueService: LeagueCompService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}


  ngOnInit(): void {
    this.isLoading = true;
    this.leagueService.getRosterForUpdate(this.route.snapshot.params['leagueId'], this.route.snapshot.params['rosterId']).subscribe({
      next: (rosterData) => {
        this.roster = rosterData;
        this.selectedTeamPicture = this.teamPictures[rosterData.teamName] || '';
        console.log('Fetched roster data for update:', rosterData);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching roster data:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }


  updateRoster() {

  
  }
}
