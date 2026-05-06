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
        this.pastTrades = this.trades.filter(trade => trade.status !== 'pending');
        this.trades = this.trades.filter(trade => trade.status === 'pending');
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


            this.members = this.members.filter((member: any) => member.user_id !== this.profile.user_id);
            this.profile = profile;

            this.leagueCompService.getAllTradeMembers(leagueId).subscribe(rosters => {
              if (rosters.length === 0) {
                console.log('No trade members found for league:', leagueId);
              } else {
                console.log('Fetched trade members:', rosters);
                this.rosters = rosters;
                this.myRosters = this.rosters.filter((r: any) => r.owner_id === this.profile?.user_id);
                this.otherRosters = this.rosters.filter((r: any) => r.owner_id !== this.profile?.user_id);
                this.proposingTeamId = this.myRosters[0]?.id || '';
                this.populateProposingTeamPlayers();
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            }, error => {
              console.error('Error fetching trade members:', error);
            });

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

  proposeTrade() {
    this.requesting = true;
    const tradeData = {
      proposingTeamId: this.proposingTeamId,
      receivingTeamUsername: this.otherRosters.find(r => r.id === this.receivingTeamId)?.team_name,
      receivingTeamId: this.otherRosters.find(r => r.id === this.receivingTeamId)?.id,
      offeredPlayerId: this.proposingTradeCharacters.map(trade => trade.id),
      requestedPlayerId: this.receivingTradeCharacters.map(trade => trade.id),
      proposingTeamUsername: this.profile?.username || 'Unknown User',
      offeredPlayerName: this.proposingTradeCharacters.map(trade => trade.character_name),
      requestedPlayerName: this.receivingTradeCharacters.map(trade => trade.character_name),
      receivingTeamUserId: this.otherRosters.find(r => r.id === this.receivingTeamId)?.owner_id
    };

    console.log('Trade data being sent to server:', tradeData);
    this.leagueCompService.proposeTrade(this.route.parent?.snapshot.params['leagueId'], tradeData).subscribe({
      next: (response) => {
        console.log('Trade proposed successfully:', response);
        window.alert('Trade proposed successfully!');
        this.trades.push(response);
        this.requesting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'You have too many active trade requests. Please wait for them to be resolved before proposing new trades.');
        console.error('Error proposing trade:', err);
        this.requesting = false;
        this.cdr.detectChanges();
      }
    });
  }

  acceptTrade(tradeId: string) {
    this.requesting = true;

    this.leagueCompService.acceptTrade(tradeId).subscribe({
      next: (response) => {
        console.log('Trade accepted successfully:', response);
        window.alert('Trade accepted successfully!');
        this.trades = this.trades.filter(trade => trade.id !== tradeId);
        this.requesting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Error accepting trade. Please try again later.');
        console.error('Error accepting trade:', err);
        this.requesting = false;
        this.cdr.detectChanges();
      }
    });
  }

  rejectTrade(tradeId: string) {
    this.requesting = true;

    this.leagueCompService.rejectTrade(tradeId).subscribe({
      next: (response) => {
        console.log('Trade rejected successfully:', response);
        window.alert('Trade rejected successfully!');
        this.trades = this.trades.filter(trade => trade.id !== tradeId);
        this.requesting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Error rejecting trade. Please try again later.');
        console.error('Error rejecting trade:', err);
        this.requesting = false;
        this.cdr.detectChanges();
      }
    });
  }

  addToTradeProposing() {
    const player = this.proposingTeamPlayers.find(p => p.character_id === +this.offeredPlayerId);
    const tradeItem: Trade = {
      id: player.character_id,
      character_name: player.name
    };

    const alreadyAdded = this.proposingTradeCharacters.some(trade => trade.id === tradeItem.id);
    if (alreadyAdded) {
      alert('This character has already been added to the trade.');
      return;
    }
    this.proposingTradeCharacters.push(tradeItem);
    this.propAdded = true;
  }

  addToTradeReceiving() {
    const player = this.receivingTeamPlayers.find(p => p.character_id === +this.requestedPlayerId);
    const tradeItem: Trade = {
      id: player.character_id,
      character_name: player.name
    };

    const alreadyAdded = this.receivingTradeCharacters.some(trade => trade.id === tradeItem.id);
    if (alreadyAdded) {
      alert('This character has already been added to the trade.');
      return;
    }
    this.receivingTradeCharacters.push(tradeItem);
    this.recAdded = true;
  }
}
