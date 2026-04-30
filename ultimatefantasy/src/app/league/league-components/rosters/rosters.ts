import { Component, Input } from '@angular/core';


import { LeagueCompService } from '../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { Router } from '@angular/router';

import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-rosters',
  standalone: false,
  templateUrl: './rosters.html',
  styleUrl: './rosters.css',
})
export class Rosters {
  rosters: any[] = [];
  canCreateRoster: boolean = false;

  creatingRoster: boolean = false;

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


  profile: {
    username: string;
  } | null = null;

  constructor(
    private leagueService: LeagueCompService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router) {

  }
  @Input() leagueId: string | null = null;

  newRosterName: string = '';
  currentUserId: string | null = null;
  isLoading: boolean = false;




  ngOnInit(): void {
    this.isLoading = true;
    this.route.parent?.params.pipe(
      map(params => params['leagueId']),
      filter(leagueId => !!leagueId),
      switchMap(leagueId => {
        this.leagueId = leagueId;
        return this.leagueService.getAllRosters(leagueId);
      })
    ).subscribe(rosters => {
      this.rosters = rosters;
      console.log('Fetched rosters:', rosters);
      this.isLoading = false;
      this.cdr.detectChanges();
    });



    this.leagueService.getProfile().subscribe((profile: any) => {
      this.profile = profile;
      this.cdr.detectChanges();
    });


    this.route.parent?.params.pipe(
      map(params => params['leagueId']),
      filter(leagueId => !!leagueId),
      switchMap(leagueId => {
        this.leagueId = leagueId;
        return this.leagueService.getUserIdFromBackend().pipe(
          filter(userId => !!userId),
          switchMap(userId => this.leagueService.canCreateRoster(leagueId, userId))
        );
      })
    ).subscribe(canCreate => {
      this.canCreateRoster = canCreate;
      this.leagueService.getUserIdFromBackend().subscribe({
        next: (userId) => {
          this.currentUserId = userId;
          console.log('Fetched user ID for roster creation:', userId);
        },
        error: (err) => console.error('Error fetching user ID for roster creation:', err)
      });
      this.isLoading = false;
      this.cdr.detectChanges();
    });

  }

  createRoster() {
    this.creatingRoster = true;
    if (!this.leagueId || !this.currentUserId) {
      console.error('Missing leagueId or userId');
      return;
    }
    this.leagueService.rosterCreate(this.leagueId!, this.newRosterName, this.selectedTeamPicture, this.currentUserId, this.profile?.username ?? null).subscribe({
      next: roster => {
        console.log('Roster created:', roster);
        this.rosters.push(roster);
        this.newRosterName = '';
        this.creatingRoster = false;
        this.canCreateRoster = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error creating roster:', err);
      }
    });


  }

  onRosterClick(roster: any) {
    console.log('Navigating with roster:', roster);
    this.router.navigate([
      '/league-page',
      this.leagueId,
      'teams',
      roster.id
    ]);
  }

  trades() {
    this.router.navigate([
      '/league-page',
      this.leagueId,
      'trades'
    ]);
  }




}
