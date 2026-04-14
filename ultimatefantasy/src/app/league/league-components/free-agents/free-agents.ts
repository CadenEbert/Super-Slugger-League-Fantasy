import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeagueCompService } from '../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-free-agents',
  standalone: false,
  templateUrl: './free-agents.html',
  styleUrl: './free-agents.css',
})
export class FreeAgents {
  players: any[] = [];

  constructor(
    private leagueService: LeagueCompService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const leagueId = this.route.parent?.snapshot.paramMap.get('leagueId');
    if (leagueId) {
      this.leagueService.getFreeAgents(leagueId).subscribe(freeAgents => {
        console.log('Fetched free agents:', freeAgents);

        this.players = freeAgents;
        console.log('Free agents set to:', this.players);
        this.cdRef.detectChanges();
      });


    };





  }
}
