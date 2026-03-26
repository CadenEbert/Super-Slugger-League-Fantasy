import { Injectable, Input } from '@angular/core';
import { LeagueApiService } from '../core/league.service';

@Injectable({
  providedIn: 'root',
})
export class LeagueService {

  @Input() leagues: any[] = [];

  constructor(private leagueApiService: LeagueApiService) { }

  getLeagues() {
    
    return this.leagueApiService.getLeaguesForCurrentUser();
  }
  

  getLeagueById(id: number) {
    return this.leagues.find(league => league.id === id);
  }


}
