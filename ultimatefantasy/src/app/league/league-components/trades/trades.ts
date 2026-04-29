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

  receivingTeamId: string = '';
  proposingTeamId: string = '';



  requestedPlayerId: string = '';
  offeredPlayerId: string = '';


  proposingTeamPlayers: any[] = [];
  receivingTeamPlayers: any[] = [];



  allCharacters: any[] = [];

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
        this.leagueCompService.getAllCharacterNames().subscribe(characterNames => {
          const characterMap = new Map(characterNames.map((char: any) => [char.ID, char.character_name]));
          console.log('Character map:', characterMap);
          console.log('First character object:', characters[0]);
          this.characters = characters.map((char: any) => ({
            ...char,
            name: characterMap.get(char.character_id) || 'Unknown Character'
          }));
          console.log('Characters after mapping names:', this.characters);
          this.populateProposingTeamPlayers();
          console.log('Characters with names:', this.characters);
          this.isLoading = false;
          this.cdr.detectChanges();
        }, error => {
          console.error('Error fetching character names:', error);
        });


       
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
    const newRoster = this.rosters.find((r: any) => r.id === this.receivingTeamId);
    if (newRoster) {
      this.receivingTeamPlayers = this.characters.filter(
        (char: any) => char.roster_id === newRoster.id
      );
    } else {
      this.receivingTeamPlayers = [];
    }


  }

  populateProposingTeamPlayers() {
    if (!this.profile || !this.rosters.length || !this.characters.length) return;
    console.log('Populating proposing team players with profile:', this.profile, 'rosters:', this.rosters, 'characters:', this.characters);
    console.log('Finding roster for user ID:', this.profile.user_id);
    console.log('Rosters available:', this.rosters);

    const myRoster = this.rosters.find((r: any) => r.owner_id === this.profile.user_id);
    console.log('Found roster for current user:', myRoster);
    this.proposingTeamId = myRoster?.id ?? '';
    console.log('Proposing team ID set to:', this.proposingTeamId);

    this.proposingTeamPlayers = this.characters.filter(
      (char: any) => char.roster_id === this.proposingTeamId
    );

    this.rosters = this.rosters.filter((r: any) => r.owner_id !== this.proposingTeamId);
  }

  proposeTrade(roster_name: string) {
      const tradeData = {
        proposingTeamId: this.proposingTeamId,
        receivingTeamUsername: roster_name,
        receivingTeamId: this.receivingTeamId,
        offeredPlayerId: this.offeredPlayerId,
        requestedPlayerId: this.requestedPlayerId,
        proposingTeamUsername: this.profile?.username || 'Unknown User',
        offeredPlayerName: this.characters.find((char: any) => char.character_id === +this.offeredPlayerId)?.name || 'Unknown Character',
        requestedPlayerName: this.characters.find((char: any) => char.character_id === +this.requestedPlayerId)?.name || 'Unknown Character'
      };

      console.log('Trade data being sent to server:', tradeData);
      this.leagueCompService.proposeTrade(this.route.parent?.snapshot.params['leagueId'], tradeData).subscribe({
        next: (response) => {
          console.log('Trade proposed successfully:', response);
          window.alert('Trade proposed successfully!');
          this.trades.push(response);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error proposing trade:', err);
          window.alert('Error proposing trade. Please try again.');
        }
      });
  }

  
}
