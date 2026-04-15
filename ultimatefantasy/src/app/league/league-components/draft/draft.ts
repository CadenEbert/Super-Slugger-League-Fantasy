import { Component } from '@angular/core';
import { DraftService } from '../draft-service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-draft',
  standalone: false,
  templateUrl: './draft.html',
  styleUrl: './draft.css',
})
export class Draft {
  draftId: string = '';


  draftData: any = null;

  constructor(private draftService: DraftService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.draftService.getDraftId(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (id) => {
        this.draftId = id;
        console.log('Draft ID:', id);
        this.draftService.onDraftUpdate(id);
        this.draftService.joinDraft(id);
     
      },
      error: (err) => {
        console.error('Error fetching draft ID:', err);
      }
    });

    

    this.draftService.getInitialDraftData(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (data) => {
        this.draftData = data;
      },
      error: (err) => {
        console.error('Error fetching initial draft data:', err);
      }
    });

    
  }


}
