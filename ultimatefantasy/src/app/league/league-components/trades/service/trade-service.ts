import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Trade } from '../../../../core/models/trade.model.js'

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  isLoading$ = new BehaviorSubject<boolean>(true);
  requesting$ = new BehaviorSubject<boolean>(false);

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
  profile$ = new BehaviorSubject<any>(null);




}
