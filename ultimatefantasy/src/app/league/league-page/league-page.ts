import { Component } from '@angular/core';

@Component({
  selector: 'app-league-page',
  standalone: false,
  templateUrl: './league-page.html',
  styleUrl: './league-page.css',
})
export class LeaguePage {
  league = {
    id: 1,
    name: 'Fantasy League 1',
    description: 'A fun fantasy league for football fans.',
    size: 10,
    draftSettings: 'Standard',
    members: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ],
  };


  
}
