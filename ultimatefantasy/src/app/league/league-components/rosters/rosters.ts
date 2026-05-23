import { Component } from '@angular/core';
import { LeagueCompService } from '../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { RosterService } from './service/roster-service';



@Component({
  selector: 'app-rosters',
  standalone: false,
  templateUrl: './rosters.html',
  styleUrl: './rosters.css',
})
export class Rosters {




  constructor(
    protected rosterService: RosterService,
    private route: ActivatedRoute
  ) {

  }


  newRosterName: string = '';
  selectedTeamPicture: string = '';



  ngOnInit() {
    this.rosterService.loadRoster(this.route.parent?.snapshot.params['leagueId']);
  }


  createRoster() {
    this.rosterService.createRoster(this.newRosterName, this.selectedTeamPicture);
  }

}
