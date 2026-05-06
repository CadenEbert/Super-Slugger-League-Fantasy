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
}
