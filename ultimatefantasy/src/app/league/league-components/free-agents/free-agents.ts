import { Component } from '@angular/core';

@Component({
  selector: 'app-free-agents',
  standalone: false,
  templateUrl: './free-agents.html',
  styleUrl: './free-agents.css',
})
export class FreeAgents {
  freeAgents: any[] = [{uuid: '1', name: 'Player 1', position: 'left-field'}, {uuid: '2', name: 'Player 2', position: 'right-field'}]; 
}
