import { Component } from '@angular/core';
import { LeagueCompService } from '../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-trades',
  standalone: false,
  templateUrl: './trades.html',
  styleUrl: './trades.css',
})
export class Trades {
  isLoading: boolean = true;

  trades: any[] = [];

  members: any[] = [];

  characters: any[] = [];

  proposingTeamId: string = '';
  receivingTeamId: string = '';
  proposingTeamPlayers: any[] = [];
  receivingTeamPlayers: any[] = [];

  rosters: any[] = [];

  profile: any;

  constructor(private leagueCompService: LeagueCompService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    const leagueId = this.route.parent?.snapshot.params['leagueId'];
    this.leagueCompService.getTrades(this.route.parent?.snapshot.params['leagueId']).subscribe(trades => {
      if (trades.length === 0) {
        console.log('No trades found for league:', leagueId);
        this.isLoading = false;
        this.cdr.detectChanges();
      } else {
        console.log('Fetched trades:', trades);
        this.trades = trades;
        this.isLoading = false;
        this.cdr.detectChanges();
      }


    }, error => {
      console.error('Error fetching trades:', error);
    });




    this.leagueCompService.getAllCharacters(this.route.parent?.snapshot.params['leagueId']).subscribe(characters => {
      if (characters.length === 0) {
        console.log('No characters found');
      } else {
        console.log('Fetched characters:', characters);
        this.characters = characters;
        this.populateProposingTeamPlayers();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, error => {
      console.error('Error fetching characters:', error);
    });

    this.leagueCompService.getAllMembers(leagueId).subscribe(members => {

      if (members.length === 0) {
        console.log('No members found for league:', leagueId);
      } else {
        console.log('Fetched members:', members);
        this.members = members;

        this.leagueCompService.getProfile().subscribe(profile => {
          if (!profile) {
            console.log('No profile found');
          } else {
            console.log('Fetched profile:', profile);
            this.profile = profile;

            profile ? this.proposingTeamId = profile.teamId : this.proposingTeamId = '';
            this.members = this.members.filter((member: any) => member.user_id !== this.profile.user_id);
            this.profile = profile;
            this.proposingTeamId = profile?.teamId ?? '';
            this.populateProposingTeamPlayers();

            this.isLoading = false;
            this.cdr.detectChanges();
          }
        }, error => {
          console.error('Error fetching profile:', error);
        });


        console.log('Filtered members (excluding current user):', this.members);

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, error => {
      console.error('Error fetching members:', error);
    });

    this.leagueCompService.getAllTradeMembers(leagueId).subscribe(rosters => {
      if (rosters.length === 0) {
        console.log('No trade members found for league:', leagueId);
      } else {
        console.log('Fetched trade members:', rosters);
        this.rosters = rosters;
        this.rosters = rosters;
        this.populateProposingTeamPlayers();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, error => {
      console.error('Error fetching trade members:', error);
    });
  }


  onReceivingTeamChange() {
    this.receivingTeamPlayers = this.characters.filter(
      (char: any) => char.team_id === this.receivingTeamId
    );
  }

  populateProposingTeamPlayers() {
    if (!this.profile || !this.rosters.length || !this.characters.length) return;

    const myRoster = this.rosters.find((r: any) => r.id === this.profile.teamId);
    this.proposingTeamId = myRoster?.id ?? '';
    this.proposingTeamPlayers = this.characters.filter(
      (char: any) => char.team_id === this.proposingTeamId
    );

    this.rosters = this.rosters.filter((r: any) => r.id !== this.proposingTeamId);
  }
}
