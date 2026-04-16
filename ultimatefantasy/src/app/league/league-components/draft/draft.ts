import { Component } from '@angular/core';
import { DraftService } from '../draft-service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';



@Component({
  selector: 'app-draft',
  standalone: false,
  templateUrl: './draft.html',
  styleUrl: './draft.css',
})
export class Draft {
  private draftDataSubject = new BehaviorSubject<any>(null);
  draftData$: Observable<any> = this.draftDataSubject.asObservable();
  draftId: string = '';

  members: any[] = [];

  players: any[] = ["Player 1", "Player 2", "Player 3"]; 


 

  constructor(private draftService: DraftService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.draftService.getDraftId(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (id) => {
        this.draftId = id;
        console.log('Draft ID:', id);
        this.draftService.onDraftUpdate(id).subscribe(update => {
          console.log('Live update:', update);
          this.setDraftData(update.new);
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
        this.members = members;
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

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.players, event.previousIndex, event.currentIndex);
  }
}