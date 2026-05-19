import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { Trade } from '../../../../core/models/trade.model.js'
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../auth/auth-service.js';
import { LeagueCompService } from '../../league-comp-service.js';

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  isLoading$ = new BehaviorSubject<boolean>(true);
  requesting$ = new BehaviorSubject<boolean>(false);
  leagueId$ = new BehaviorSubject<string>('');

  trades$ = new BehaviorSubject<any[]>([]);
  members$ = new BehaviorSubject<any[]>([]);
  characters$ = new BehaviorSubject<any[]>([]);

  receivingTeamId$ = new BehaviorSubject<string>('');
  proposingTeamId$ = new BehaviorSubject<string>('');

  receivingTradeCharacters$ = new BehaviorSubject<Trade[]>([]);
  proposingTradeCharacters$ = new BehaviorSubject<Trade[]>([]);

  propAdded$ = new BehaviorSubject<boolean>(false);
  recAdded$ = new BehaviorSubject<boolean>(false);

  requestedPlayerId$ = new BehaviorSubject<string>('');
  offeredPlayerId$ = new BehaviorSubject<string>('');

  proposingTeamPlayers$ = new BehaviorSubject<any[]>([]);
  receivingTeamPlayers$ = new BehaviorSubject<any[]>([]);

  pastTrades$ = new BehaviorSubject<any[]>([]);
  allCharacters$ = new BehaviorSubject<any[]>([]);

  myRosters$ = new BehaviorSubject<any[]>([]);
  rosters$ = new BehaviorSubject<any[]>([]);
  otherRosters$ = new BehaviorSubject<any[]>([]);
  userId$ = new BehaviorSubject<string>('');




  constructor(private authService: AuthService, private leagueCompService: LeagueCompService) {
    this.userId$.next(this.authService.getUserId());
  }



  loadTrades(leagueId: string) {
    this.leagueId$.next(leagueId);

    forkJoin({
      trades: this.leagueCompService.getTrades(leagueId),
      characters: this.leagueCompService.getAllCharacters(leagueId),
      characterNames: this.leagueCompService.getAllCharacterNames(),
      allMembers: this.leagueCompService.getAllMembers(leagueId),
      tradeMembers: this.leagueCompService.getAllTradeMembers(leagueId)
    }).subscribe(({ trades, characters, characterNames, allMembers, tradeMembers }) => {
      this.trades$.next(trades.filter(trade => trade.receiving_team_user_id === this.userId$.value && trade.status === 'pending'));
      this.pastTrades$.next(trades.filter(trade => trade.status !== 'pending'));

      const characterMap = new Map(characterNames.map((char: any) => [char.ID, char.character_name]));
      this.characters$.next(characters.map((char: any) => ({
        ...char,
        name: characterMap.get(char.character_id) || 'Unknown Character'
      })));


      this.members$.next(allMembers.filter((member: any) => member.user_id !== this.userId$.value));
      this.rosters$.next(tradeMembers);
      this.myRosters$.next(tradeMembers.filter((roster: any) => roster.owner_id === this.userId$.value));
      this.otherRosters$.next(tradeMembers.filter((roster: any) => roster.owner_id !== this.userId$.value));      
      this.proposingTeamId$.next(this.myRosters$.value[0]?.id);
  
      this.populateProposingTeamPlayers();
      this.setIsLoading(false);
    })

  }




  setIsLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
  }

  onReceivingTeamChange() {
    const newRoster = this.rosters$.value.find((r: any) => r.id === this.receivingTeamId$.value);
    if (newRoster) {
      this.receivingTeamPlayers$.next(this.characters$.value.filter(
        (char: any) => char.roster_id === newRoster.id
      ));
    } else {
      this.receivingTeamPlayers$.next([]);
    }


  }
  onRequestedPlayerChange() {

  }

  populateProposingTeamPlayers() {
    const myRoster = this.rosters$.value.find((r: any) => r.owner_id === this.userId$.value);
    console.log('Found roster for current user:', myRoster);
    this.proposingTeamId$.next(myRoster?.id ?? '');
    console.log('Proposing team ID set to:', this.proposingTeamId$.value);

    this.proposingTeamPlayers$.next(this.characters$.value.filter(
      (char: any) => char.roster_id === this.proposingTeamId$.value
    ));

    this.rosters$.next(this.rosters$.value.filter((r: any) => r.owner_id !== this.proposingTeamId$.value));
  }

  proposeTrade() {
    this.requesting$.next(true);
    const tradeData = {
      proposingTeamId: this.proposingTeamId$.value,
      receivingTeamUsername: this.otherRosters$.value.find(r => r.id === this.receivingTeamId$.value)?.team_name,
      receivingTeamId: this.otherRosters$.value.find(r => r.id === this.receivingTeamId$.value)?.id,
      offeredPlayerId: this.proposingTradeCharacters$.value.map(trade => trade.id),
      requestedPlayerId: this.receivingTradeCharacters$.value.map(trade => trade.id),

      offeredPlayerName: this.proposingTradeCharacters$.value.map(trade => trade.character_name),
      requestedPlayerName: this.receivingTradeCharacters$.value.map(trade => trade.character_name),
      receivingTeamUserId: this.otherRosters$.value.find(r => r.id === this.receivingTeamId$.value)?.owner_id
    };

    console.log('Trade data being sent to server:', tradeData);
    this.leagueCompService.proposeTrade(this.leagueId$.value, tradeData).subscribe({
      next: (response) => {
        console.log('Trade proposed successfully:', response);
        globalThis.alert('Trade proposed successfully!');
        this.requesting$.next(false);

      },
      error: (err) => {
        alert(err.error?.message || 'You have too many active trade requests. Please wait for them to be resolved before proposing new trades.');
        console.error('Error proposing trade:', err);
        this.requesting$.next(false);
      }
    });
  }

  acceptTrade(tradeId: string) {
    this.requesting$.next(true);

    this.leagueCompService.acceptTrade(tradeId).subscribe({
      next: (response) => {
        console.log('Trade accepted successfully:', response);
        window.alert('Trade accepted successfully!');
        this.trades$.next(this.trades$.value.filter(trade => trade.id !== tradeId));
        this.requesting$.next(false);

      },
      error: (err) => {
        alert(err.error?.message || 'Error accepting trade. Please try again later.');
        console.error('Error accepting trade:', err);
        this.requesting$.next(false);
      }
    });
  }

  rejectTrade(tradeId: string) {
    this.requesting$.next(true);

    this.leagueCompService.rejectTrade(tradeId).subscribe({
      next: (response) => {
        console.log('Trade rejected successfully:', response);
        globalThis.alert('Trade rejected successfully!');
        this.trades$.next(this.trades$.value.filter(trade => trade.id !== tradeId));
        this.requesting$.next(false);

      },
      error: (err) => {
        alert(err.error?.message || 'Error rejecting trade. Please try again later.');
        console.error('Error rejecting trade:', err);
        this.requesting$.next(false);

      }
    });
  }



  addToTradeProposing() {
    const player = this.proposingTeamPlayers$.value.find(p => p.character_id === +this.offeredPlayerId$.value);
    const tradeItem: Trade = {
      id: player.character_id,
      character_name: player.name
    };

    const alreadyAdded = this.proposingTradeCharacters$.value.some(trade => trade.id === tradeItem.id);
    if (alreadyAdded) {
      alert('This character has already been added to the trade.');
      return;
    }
    this.proposingTradeCharacters$.next([...this.proposingTradeCharacters$.value, tradeItem]);
    this.propAdded$.next(true);
    console.log(this.propAdded$.value)
  }

  addToTradeReceiving() {
    const player = this.receivingTeamPlayers$.value.find(p => p.character_id === +this.requestedPlayerId$.value);
    const tradeItem: Trade = {
      id: player.character_id,
      character_name: player.name
    };

    const alreadyAdded = this.receivingTradeCharacters$.value.some(trade => trade.id === tradeItem.id);
    if (alreadyAdded) {
      alert('This character has already been added to the trade.');
      return;
    }
    this.receivingTradeCharacters$.next([...this.receivingTradeCharacters$.value, tradeItem]);
    this.recAdded$.next(true);
    console.log(this.recAdded$.value)
  }


}
