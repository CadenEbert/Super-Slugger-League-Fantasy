import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeagueCompService } from '../league-comp-service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Router } from '@angular/router';

import { RosterPageService } from './service/roster-page-service';




@Component({
  selector: 'app-roster-page',
  standalone: false,
  templateUrl: './roster-page.html',
  styleUrl: './roster-page.css',
})
export class RosterPage {


  constructor(public rosterpageService: RosterPageService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.rosterpageService.loadRosterPage(this.route.parent?.snapshot.params['leagueId'], this.route.snapshot.params['rosterId']);
  }

}
