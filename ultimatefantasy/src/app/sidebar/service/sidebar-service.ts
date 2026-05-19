import { Injectable } from '@angular/core';
import { LeagueService } from '../../league/league-service';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/auth-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly userId$ = new BehaviorSubject<string>('');
  public readonly isOwner$ = new BehaviorSubject<boolean>(false);
  private readonly leagueId$ = new BehaviorSubject<string>('');



  constructor(private leagueService: LeagueService, private authService: AuthService, private router: Router) { }

  loadSideBar(league_id: string) {
    this.userId$.next(this.authService.getUserId());
    this.leagueId$.next(league_id);

    this.leagueService.getOwnerId(league_id).subscribe(id => {

      if (this.userId$.value === id) {
        this.isOwner$.next(true);
      }
    });
  }

  leaveLeague() {
    this.leagueService.leaveLeague(this.leagueId$.value).subscribe({
      next: () => {
        globalThis.alert('Left League Successfully');
        this.router.navigate(['']);

      },
      error: () => globalThis.alert('Failed to leave league')
    });

   
  }




}
