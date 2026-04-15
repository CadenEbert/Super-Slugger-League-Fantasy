import { Component } from '@angular/core';
import { DraftService } from '../draft-service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';


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



 

  constructor(private draftService: DraftService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.draftService.getDraftId(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (id) => {
       
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


  }

  setDraftData(data: any) {
    this.draftDataSubject.next(data);
  }


}
