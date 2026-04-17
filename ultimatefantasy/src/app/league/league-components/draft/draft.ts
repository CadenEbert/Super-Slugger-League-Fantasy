import { Component } from '@angular/core';
import { DraftService } from '../draft-service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export interface DraftState {
  id: string;
  league_id: string;
  status: 'pending' | 'in_progress' | 'done';
  current_pick: number;
  round: number;
  pick_order: string[];
  // Add other fields as needed
}

export interface DraftPick {
  id: string;
  draft_id: string;
  member_id: string;
  player_id: string;
  pick_number: number;
  round: number;
  // Add other fields as needed
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
      },
      error: (err) => {
        console.error('Error fetching initial draft data:', err);
      }
    });



    this.draftService.getAllLeagueMembers(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (members) => {
        this.setMembers(members);

        this.setDraftDataPlayerList(members.map((m: any) => m.id));
        console.log('League Members:', members);

      },
      error: (err) => {
        console.error('Error fetching league members:', err);
      }
    });




  }

  setDraftData(data: any) {
    this.draftDataSubject.next(data);
  }

  setDraftPlayers(players: DraftPick[]) {
    this.draftPlayersSubject.next(players);
  }

  setDraftDataPlayerList(data: string[]) {
    const current = this.draftDataSubject.value;
    if (current) {
      this.draftDataSubject.next({ ...current, pick_order: data });
    }
  }

  startDraft() {
    const current = this.draftDataSubject.value;
    if (current) {
      this.draftDataSubject.next({ ...current, status: 'in_progress' });



      this.draftService.updateDraftData(this.draftId, { ...current, status: 'in_progress' }).subscribe({
        next: () => console.log('Draft started'),
        error: (err) => console.error('Error starting draft:', err)

      });
    }
  }

  setMembers(members: any[]) {
    members.forEach(member => {
      this.memberMap[member.id] = member.username;
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(Object.values(this.memberMap), event.previousIndex, event.currentIndex);
  }
}