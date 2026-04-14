import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { LeagueCompService } from '../league-comp-service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { filter } from 'rxjs/internal/operators/filter';


@Component({
  selector: 'app-roster-page',
  standalone: false,
  templateUrl: './roster-page.html',
  styleUrl: './roster-page.css',
})
export class RosterPage {
  players: any[] = [];
  rosterName: string = '';
  username: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private leagueService: LeagueCompService,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.leagueService.getProfile().subscribe((profile: any) => {
      this.username = profile.username;
      console.log('Profile data in RosterPage:', profile);
    });

    this.leagueService.getAllPlayers(this.route.parent?.snapshot.params['leagueId'], this.route.snapshot.params['rosterId']).subscribe(players => {
      console.log('Fetched players:', players);
      this.players = players;
      this.cdr.detectChanges();
      console.log('players:', JSON.stringify(this.players, null, 2));
    });

  }



}
