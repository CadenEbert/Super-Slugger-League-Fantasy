import { Injectable } from '@angular/core';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeagueCompService } from '../../league-comp-service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth-service';


@Injectable({
  providedIn: 'root',
})
export class RosterPageService {

  readonly players$ = new BehaviorSubject<any[]>([]);
  positions: string[] = ['Bench', 'Pitcher', 'Catcher', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
  battingOrders: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  readonly isLoading$ = new BehaviorSubject<boolean>(false);
  private ownerId$ = new BehaviorSubject<string>('');
  private userId$ = new BehaviorSubject<string>('');
  private rosterId$ = new BehaviorSubject<string>('');
  private leagueId$ = new BehaviorSubject<string>('');
  readonly protections$ = new BehaviorSubject<number>(0);



  constructor(
    private leagueService: LeagueCompService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router

  ) {
    this.userId$.next(this.authService.getUserId());

  }


  loadRosterPage(leagueId: string, rosterId: string) {
    this.isLoading$.next(true);
    this.leagueId$.next(leagueId);
    this.rosterId$.next(rosterId);

    forkJoin({
      ownerId: this.leagueService.getOwnerId(rosterId),
      players: this.leagueService.getAllPlayers(leagueId, rosterId),
      protections: this.leagueService.getProtections(leagueId)
    }).subscribe(({ ownerId, players, protections }) => {
      this.ownerId$.next(ownerId);
      this.players$.next(players);
      this.protections$.next(protections);
      this.isLoading$.next(false);


    })

  }

  savePlayer(p: any) {

    this.leagueService.savePlayer(this.leagueId$.value, this.rosterId$.value, p).subscribe({
      next: () => {
        alert('Position updated successfully');
        window.location.reload();
        console.log('Position updated successfully');
      },
      error: (err) => {
        alert('Error updating position');
        console.error('Error updating position:', err);
      }
    })
  }

  removePlayer(characterId: string) {

    this.leagueService.removePlayer(this.leagueId$.value, this.rosterId$.value, characterId).subscribe({
      next: () => {
        alert('Player removed successfully');
        this.players$.next(this.players$.value.filter(p => p.character.id !== characterId));

      },
      error: () => {
        alert('Error removing player');
      }
    });
  }

  rosterInfo() {
    this.router.navigate(['/league-page', this.route.parent?.snapshot.params['leagueId'], 'teams', this.route.snapshot.params['rosterId'], 'update-roster'],
      { state: { rosterId: this.route.snapshot.params['rosterId'] } }
    );

  }

  getNumberOfProtected() {
    let count = 0;
    for (const player of this.players$.value) {
      if (player.protected === true) {
        count++;
      }
    }
    return count;
  }

}
