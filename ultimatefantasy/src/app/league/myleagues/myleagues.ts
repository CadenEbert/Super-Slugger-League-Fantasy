import { Component, ChangeDetectorRef } from '@angular/core';
import { LeagueService } from '../league-service';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { take } from 'rxjs/internal/operators/take';
import { filter } from 'rxjs/internal/operators/filter';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-myleagues',
  standalone: false,
  templateUrl: './myleagues.html',
  styleUrl: './myleagues.css',
})
export class Myleagues {
  leagues: any[] = [];

  

  constructor(
    private leagueService: LeagueService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {

    this.authService.session$.pipe(
      filter(session => {
        console.log('Session in myleagues:', session);
        return !!session?.access_token;
      }),
      take(1),
      switchMap(() => this.leagueService.getLeaguesForCurrentUser())
    ).subscribe(leagues => {
      this.leagues = leagues;
      console.log('DATA:', leagues);
      this.cdr.detectChanges();
    });

    
  }

  

  selectLeague(league: any) {
    console.log('Navigating with league:', league);
    this.router.navigate(['/league-page', league.id]);
  }
}