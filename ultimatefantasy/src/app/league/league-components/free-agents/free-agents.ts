import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeagueCompService } from '../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../core/auth.service';


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
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const leagueId = this.route.parent?.snapshot.paramMap.get('leagueId');

    this.leagueService.getDraftStatus(this.route.parent?.snapshot.params['leagueId']).subscribe(status => {
      this.draftStatus = status;
      console.log('Draft status in Rosters:', this.draftStatus);
      this.isLoading = false;
      this.cdRef.detectChanges();
    });


    this.authService.session$.subscribe(session => {
      const userId = session?.user?.id;
      

      if (leagueId) {
        this.leagueService.getFreeAgents(leagueId).subscribe(freeAgents => {
          this.players = freeAgents;
          this.isLoading = false;
          this.cdRef.detectChanges();
        });

        if (userId) {
          console.log('Fetching roster ID for leagueId:', leagueId, 'and userId:', userId);
          this.leagueService.getUsersRosterId(leagueId, userId).subscribe(id => {
            this.rosterId = id;
            this.isLoading = false;
            this.cdRef.detectChanges();
            console.log('Fetched roster ID:', this.rosterId);
          });
        }
      }
    });
    
   
  }

  addToRoster(characterId: string) {
    const leagueId = this.route.parent?.snapshot.paramMap.get('leagueId');
    console.log ('leagueId in addToRoster:', leagueId);
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
