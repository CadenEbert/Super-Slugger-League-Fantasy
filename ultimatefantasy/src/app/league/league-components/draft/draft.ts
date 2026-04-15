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


  draftData: any = null;

  constructor(private draftService: DraftService, private route: ActivatedRoute) { }

  ngOnInit() {
    
    
    

    this.draftService.getInitialDraftData(this.route.parent?.snapshot.params['leagueId']).subscribe(data => {
      console.log('Initial draft data received:', data);
      this.draftData = data;
    });
    
    this.draftService.onDraftUpdate().subscribe(update => {
      console.log('Draft update received:', update);
      this.draftData = update;
    });

    

    console.log('Draft component initialized', this.draftData);
  }


}
