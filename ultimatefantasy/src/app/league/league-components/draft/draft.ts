import { Component } from '@angular/core';
import { DraftService } from '../draft-service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export interface DraftState {
  id: string;
  league_id: string;
  status: 'not_started' | 'in_progress' | 'done';
  current_pick: number;
  round: number;
  pick_order: string[];
  current_pick_index: number;

  
}

export interface DraftPick {
  id: string;
  draft_id: string;
  member_id: string;
  player_id: string;
  pick_number: number;
  round: number;
  
}

export interface playerPool {
  id: number;
  name: string;
  

}



@Component({
  selector: 'app-draft',
  standalone: false,
  templateUrl: './draft.html',
  styleUrl: './draft.css',
})
export class Draft {
  private draftDataSubject = new BehaviorSubject<DraftState | null>(null);
  draftData$: Observable<DraftState | null> = this.draftDataSubject.asObservable();
  draftId: string = '';

  private draftPlayersSubject = new BehaviorSubject<DraftPick[]>([]);
  draftPlayers$: Observable<DraftPick[]> = this.draftPlayersSubject.asObservable();

  private pickOrderSubject = new BehaviorSubject<string[]>([]);
  pickOrder$: Observable<string[]> = this.pickOrderSubject.asObservable();

  private playerPoolSubject = new BehaviorSubject<playerPool[]>([]);
  playerPool$: Observable<playerPool[]> = this.playerPoolSubject.asObservable();
  
  public memberMap: { [id: string]: string } = {};







  constructor(private draftService: DraftService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.draftService.getDraftId(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (id) => {
        this.draftId = id;
        console.log('Draft ID:', id);
        this.draftService.getDraftPlayers(this.draftId).subscribe({
          next: (data) => {
            this.setDraftPlayers(data.players);

            
          }
        });
        this.draftService.onDraftUpdate(id).subscribe(update => {
          console.log('Live update:', update);
          this.setDraftData(update.new);

        });
        this.draftService.onDraftPlayersUpdate(id).subscribe(update => {
          console.log('Draft players update:', update);
          this.setDraftPlayers(update.new);
        });
        this.draftService.joinDraft(id);

      },
      error: (err) => {
        console.error('Error fetching draft ID:', err);
      }
    });



    this.draftService.getInitialDraftData(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (data) => {
        this.setDraftData(data);

        this.draftService.getAllLeagueMembers(this.route.parent?.snapshot.params['leagueId']).subscribe({
          next: (members) => {
            this.setMembers(members);
            console.log('First member object:', JSON.stringify(members[0]));
    
            this.setDraftDataPlayerList(members.map((m: any) => m.user_id));
    
            console.log('League Members:', members);
            console.log('Member Map:', this.memberMap);
            console.log('Draft Data  after setting members:', this.draftDataSubject.value);
    
          },
          error: (err) => {
            console.error('Error fetching league members:', err);
          }
        });

      },
      error: (err) => {
        console.error('Error fetching initial draft data:', err);
      }
    });



    




  }

  setDraftData(data: any) {
    this.draftDataSubject.next(data);
  }

  setDraftPlayers(players: DraftPick[]) {
    this.draftPlayersSubject.next(players);
  }

  setDraftDataPlayerList(data: any[]) {
    this.pickOrderSubject.next(data);
  }

  startDraft() {
    const current = this.draftDataSubject.value;
    if (current) {
      

      console.log(this.pickOrderSubject.value);

      this.draftService.updateDraftData(this.draftId, { ...current,
        status: 'in_progress',
        current_pick: 1,
        current_round: 1, 
        pick_order: this.pickOrderSubject.value 
      }).subscribe({
        next: () => console.log('Draft started'),
        error: (err) => console.error('Error starting draft:', err)

      });
    }
  }

  setMembers(members: any[]) {
    members.forEach(member => {
      this.memberMap[member.user_id] = member.username;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    const order = [...this.pickOrderSubject.value];
    moveItemInArray(order, event.previousIndex, event.currentIndex);
    this.pickOrderSubject.next(order);
  }
}