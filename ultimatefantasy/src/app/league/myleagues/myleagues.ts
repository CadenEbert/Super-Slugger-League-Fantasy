import { Component, ChangeDetectorRef } from '@angular/core';
import { LeagueService } from '../league-service';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { take } from 'rxjs/internal/operators/take';
import { AuthService } from '../../auth/auth-service';
import { LeagueCompService } from '../league-components/league-comp-service';



@Component({
  selector: 'app-myleagues',
  standalone: false,
  templateUrl: './myleagues.html',
  styleUrl: './myleagues.css',
})
export class Myleagues {
  leagues: any[] = [];
  userId: string = '';
  leagueId: string = '';
  isLoading: boolean = true;


  constructor(
    private leagueService: LeagueService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private leagueCompService: LeagueCompService,
    private authService: AuthService


  ) { }

  ngOnInit() {
    if (!this.authService.currentSession) {
      this.router.navigate(['']);
      return;
    }

    this.leagueCompService.getUserIdFromBackend().pipe(
      take(1),
      switchMap(userId => {
        this.userId = userId;
        return this.leagueService.getLeaguesForCurrentUser(userId);
      })
    ).subscribe({
      next: (leagues) => {
        this.leagues = leagues;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching leagues:', err)
    });
  }

  joinLeague(leagueId: string) {
    this.leagueService.joinLeague(leagueId, this.userId).subscribe(() => {
      console.log(`Joined league ${leagueId} successfully`);
      alert('Joined league successfully!');
      this.router.navigate(['/league-page', leagueId]);
    }, error => {
      console.error('Error joining league:', error);
      alert('Error joining league: ' + error.message);
    });
  }

  selectLeague(league: any) {
    console.log('Navigating with league:', league);
    this.router.navigate(['/league-page', league.id]);
  }
}