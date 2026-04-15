import { Component } from '@angular/core';
import { DraftService } from '../draft-service';

@Component({
  selector: 'app-draft',
  standalone: false,
  templateUrl: './draft.html',
  styleUrl: './draft.css',
})
export class Draft {

  draftData: any = null;

  constructor(private draftService: DraftService) { }

  ngOnInit() {
    this.draftService.onDraftUpdate().subscribe(update => {
      console.log('Draft update:', update);
      this.draftData = update;
      
    });
  }


}
