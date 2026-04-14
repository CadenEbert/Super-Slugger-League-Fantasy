import { Component, Input } from '@angular/core';


import { LeagueCompService } from '../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { AuthService } from '../../../core/auth.service';
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

  profile: {
    username: string;
  } | null = null;

  constructor(
    private leagueService: LeagueCompService,
     private route: ActivatedRoute,
     private authService: AuthService,
     private cdr: ChangeDetectorRef,
     private router: Router) { }
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
        return this.authService.user$.pipe(
          filter(user => !!user),
          switchMap(user => this.leagueService.canCreateRoster(leagueId, user!.id))
        );
      })
    ).subscribe(canCreate => {
      this.canCreateRoster = canCreate;
      this.currentUserId = this.authService.getUserId();
      this.isLoading = false;
      this.cdr.detectChanges();
    });
    
  }

  createRoster() {
    console.log('Creating roster with name:', this.newRosterName);
    console.log('Current leagueId:', this.leagueId);
    console.log('Current userId:', this.currentUserId);
    if (!this.leagueId || !this.currentUserId) {
      console.error('Missing leagueId or userId');
      return;
    }
    this.leagueService.rosterCreate(this.leagueId!, this.newRosterName, this.currentUserId, this.profile?.username ?? null).subscribe({
      next: roster => {
        console.log('Roster created:', roster);
        this.rosters.push(roster);
        this.newRosterName = '';
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




}
