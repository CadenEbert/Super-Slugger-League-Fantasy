import { Component } from '@angular/core';
import { LeagueCompService } from '../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { switchMap, forkJoin } from 'rxjs';


@Component({
  selector: 'app-free-agents',
  standalone: false,
  templateUrl: './free-agents.html',
  styleUrl: './free-agents.css',
})
export class FreeAgents {
  players: any[] = [];
  isLoading: boolean = true;

  rosterId: string = '';
  draftStatus: string = 'not_started';

  constructor(
    private leagueService: LeagueCompService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const leagueId = this.route.parent?.snapshot.params['leagueId'];
    if (!leagueId) {
      console.error('No leagueId found');
      return;
    }

    this.leagueService.getDraftStatus(leagueId).subscribe(status => {
      this.draftStatus = status;
      this.isLoading = false;
      this.cdRef.detectChanges();
    });

    this.leagueService.getUserIdFromBackend().pipe(
      switchMap(userId => {
        this.rosterId = '';
        if (!userId) throw new Error('No userId found');
        return forkJoin({
          freeAgents: this.leagueService.getFreeAgents(leagueId),
          rosterId: this.leagueService.getUsersRosterId(leagueId, userId)
        });
      })
    ).subscribe({
      next: ({ freeAgents, rosterId }) => {
        this.players = freeAgents;
        this.rosterId = rosterId;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: err => {
        console.error('Error in FreeAgents ngOnInit:', err);
        this.isLoading = false;
      }
    });
  }

  addToRoster(characterId: string) {
    const leagueId = this.route.parent?.snapshot.paramMap.get('leagueId');
    console.log('leagueId in addToRoster:', leagueId);
    console.log('Roster ID in addToRoster:', this.rosterId);
    console.log('Character ID in addToRoster:', characterId);

    if (leagueId && this.rosterId) {
      this.leagueService.addPlayerToRoster(leagueId, this.rosterId, characterId).subscribe({

        next: (result: any) => {
          if (result?.exists) {

            alert(result.message || 'Player is already on the roster');
          } else if (result?.error) {

            console.error('Error adding player to roster:', result.error);
          } else if (result?.full) {
            alert(result.message || 'Roster is already at maximum capacity');

          } else {

            console.log('Player added to roster successfully');
            this.players = this.players.filter(p => p.id !== characterId);
            this.cdRef.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error adding player to roster:', err);
        }
      });
    } else {
      console.error('Missing leagueId or rosterId');
    }
  }
}
