import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StandingsService {
  standingsSubject$ = new BehaviorSubject<any[]>([]);
  isLoading$ = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpClient) {}

  loadStandings(league_id: string) {
    this.http.put(`/api/leagues/${league_id}/standings/update`, {}).subscribe(data => {
      this.standingsSubject$.next(this.sortByWins(Object.values(data)));
      this.setIsLoading(false);
    })
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
  }

  sortByWins(standings: any[]) {
    for (let i = 0; i < standings.length - 1; i++) {
      for (let j = 0; j < standings.length - i - 1; j++) {
        if (standings[j].wins < standings[j + 1].wins) {
          [standings[j], standings[j + 1]] = [standings[j + 1], standings[j]];
        }
      }
    }
    return standings;
  }

  positive(team: any) {
    return team.wins > team.losses;
  }
}
