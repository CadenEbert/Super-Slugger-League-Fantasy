import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { LeagueCompService } from '../league-comp-service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { filter } from 'rxjs/internal/operators/filter';
import { AuthService } from '../../../core/auth.service.js';




@Component({
  selector: 'app-roster-page',
  standalone: false,
  templateUrl: './roster-page.html',
  styleUrl: './roster-page.css',
})
export class RosterPage {
  players: any[] = [];
  rosterName: string = '';
  username: string = '';
  userId: string = '';
  positions: string[] = ['Bench', 'Pitcher', 'Catcher', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
  battingOrders: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  ownerId: string = '';
  

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private leagueService: LeagueCompService,
    private route: ActivatedRoute,
    private authService: AuthService

  ) { }


  ngOnInit(): void {
    this.leagueService.getProfile().subscribe((profile: any) => {
      this.username = profile.username;
      console.log('Profile data in RosterPage:', profile);
    });

    this.userId = this.authService.getUserId();

    this.leagueService.getAllPlayers(this.route.parent?.snapshot.params['leagueId'], this.route.snapshot.params['rosterId']).subscribe(players => {
      this.players = players;
      this.cdr.detectChanges();

    });

  }

  changePosition(characterId: string, newPosition: string) {
    const leagueId = this.route.parent?.snapshot.params['leagueId'];
    const rosterId = this.route.snapshot.params['rosterId'];

    if (!leagueId || !rosterId) {
      console.error('Missing leagueId or rosterId');
      return;
    }

    this.leagueService.changePlayerPosition(leagueId, rosterId, characterId, newPosition).subscribe({
      next: () => {
        console.log('Position updated successfully');
      },
      error: (err) => {
        console.error('Error updating position:', err);
      }
    });
  }

  changeBattingOrder(characterId: string, newOrder: number) {
    const leagueId = this.route.parent?.snapshot.params['leagueId'];
    const rosterId = this.route.snapshot.params['rosterId'];

    if (!leagueId || !rosterId) {
      console.error('Missing leagueId or rosterId');
      return;
    }

    this.leagueService.changePlayerBattingOrder(leagueId, rosterId, characterId, newOrder).subscribe({
      next: () => {
        console.log('Batting order updated successfully');
      },
      error: (err) => {
        console.error('Error updating batting order:', err);
      }
    });
  }

  removePlayer(characterId: string) {
    const leagueId = this.route.parent?.snapshot.params['leagueId'];
    const rosterId = this.route.snapshot.params['rosterId'];

    if (!leagueId || !rosterId) {
      console.error('Missing leagueId or rosterId');
      return;
    }

    this.leagueService.removePlayer(leagueId, rosterId, characterId).subscribe({
      next: () => {
        console.log('Player removed successfully');
        this.players = this.players.filter(p => p.character.id !== characterId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error removing player:', err);
      }
    });
  }



}
