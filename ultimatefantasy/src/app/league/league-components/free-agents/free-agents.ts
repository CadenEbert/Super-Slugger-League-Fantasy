import { Component } from '@angular/core';
import { LeagueCompService } from '../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { switchMap, forkJoin } from 'rxjs';
import { FreeagentService } from '../services/freeagent-service';


@Component({
  selector: 'app-free-agents',
  standalone: false,
  templateUrl: './free-agents.html',
  styleUrl: './free-agents.css',
})
export class FreeAgents {
  
  constructor(
    public freeAgentService: FreeagentService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const leagueId = this.route.parent?.snapshot.params['leagueId'];
    if (!leagueId) {
      console.error('No leagueId found');
      return;
    }
    this.freeAgentService.loadFreeAgents(leagueId);
  }

}
