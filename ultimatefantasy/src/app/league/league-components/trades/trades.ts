import { Component } from '@angular/core';
import { TradeService } from './service/trade-service';
import { ActivatedRoute } from '@angular/router';




@Component({
  selector: 'app-trades',
  standalone: false,
  templateUrl: './trades.html',
  styleUrl: './trades.css',
})
export class Trades {


  constructor(public tradeService: TradeService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.tradeService.loadTrades(this.route.parent?.snapshot.params['leagueId']);
  }

  get offeredPlayerId() { return this.tradeService.offeredPlayerId$.value; }
  set offeredPlayerId(v: string) { this.tradeService.offeredPlayerId$.next(v); }

  get requestedPlayerId() { return this.tradeService.requestedPlayerId$.value; }
  set requestedPlayerId(v: string) { this.tradeService.requestedPlayerId$.next(v); }

  get receivingTeamId() { return this.tradeService.receivingTeamId$.value; }
  set receivingTeamId(v: string) {
     this.tradeService.receivingTeamId$.next(v);
     this.tradeService.onReceivingTeamChange();
     }
}
