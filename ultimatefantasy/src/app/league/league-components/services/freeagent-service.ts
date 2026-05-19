import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, filter } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/auth-service';
import { LeagueCompService } from '../league-comp-service';

@Injectable({
  providedIn: 'root',
})
export class FreeagentService {
  public playersSubject$ = new BehaviorSubject<any[]>([]);
  public players$ = this.playersSubject$.asObservable();

  public isLoading$ = new BehaviorSubject<boolean>(true);
  public addingToRoster$ = new BehaviorSubject<boolean>(false);
  public draftStatus$ = new BehaviorSubject<string>('not_started');
  public userId$ = new BehaviorSubject<any>('');
  public rosterId$ = new BehaviorSubject<any>('');
  public leagueId$ = new BehaviorSubject<any>('');



  constructor(private http: HttpClient, private authService: AuthService, private leagueService: LeagueCompService) {
    this.setUserId(this.authService.getUserId());
  }


  loadFreeAgents(leagueId: string) {
    this.setIsLoading(true);

    this.leagueId$.next(leagueId);
    this.http.get<{ rosterId: string }>(`/api/leagues/${leagueId}/rosters/user/${this.userId$.value}`).subscribe(data => {
      this.rosterId$.next(data.rosterId);

      forkJoin({
        draftStatus: this.http.get<{ draftStatus: string }>(`/api/draft/${leagueId}/status`),
        freeAgents: this.http.get<any[]>(`/api/leagues/${leagueId}/freeagents`)
      }).subscribe(({ draftStatus, freeAgents }) => {
        this.draftStatus$.next(draftStatus.draftStatus);
        this.playersSubject$.next(freeAgents);
        this.setIsLoading(false);
      })
    });

    

  }

  setUserId(user_id: string) {
    this.userId$.next(user_id);
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
  }

  setAddingToRoster(adding: boolean) {
    this.addingToRoster$.next(adding);
  }

  setPlayers(players: any[]) {
    this.playersSubject$.next(players);
  }

  addToRoster(characterId: string) {
    this.setAddingToRoster(true);

    if (this.leagueId$.value && this.rosterId$.value) {
      this.leagueService.addPlayerToRoster(this.leagueId$.value, this.rosterId$.value, characterId).subscribe({

        next: (result: any) => {
          if (result?.exists) {
            alert(result.message || 'Player is already on the roster');
            this.setAddingToRoster(false);
          } else if (result?.error) {
            this.setAddingToRoster(false);
            console.error('Error adding player to roster:', result.error);
          } else if (result?.full) {
            alert(result.message || 'Roster is already at maximum capacity');
            this.setAddingToRoster(false);
          } else {
            console.log('Player added to roster successfully');
            this.setPlayers(this.playersSubject$.value.filter(p => p.id !== characterId));
            this.setAddingToRoster(false);
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
