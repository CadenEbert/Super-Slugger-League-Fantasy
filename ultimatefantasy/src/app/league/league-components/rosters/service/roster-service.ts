import { Injectable } from '@angular/core';
import { LeagueCompService } from '../../league-comp-service';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth-service';

@Injectable({
  providedIn: 'root',
})
export class RosterService {
  readonly rosters$ = new BehaviorSubject<any[]>([]);
  readonly canCreateRoster$ = new BehaviorSubject<boolean>(false);
  private rosterIndex$ = new BehaviorSubject<number>(0);
  private creatingRoster$ = new BehaviorSubject<boolean>(false);
  private readonly userId$ = new BehaviorSubject<string>('');
  readonly selectedRoster$ = new BehaviorSubject<any>(null);



  teamPictures: { [key: string]: string } = {
    'Birdo Bows': 'BirdoBows-MSS.png',
    'Bowser Jr. Rookies': 'BowserJrRookies-MSS.png',
    'Bowser Monsters': 'BowserMonsters-MSS.png',
    'Daisy Flowers': 'DaisyFlowers-MSS.png',
    'Diddy Monkeys': 'DiddyMonkeys-MSS.png',
    'DK Wilds': 'DKWilds-MSS.png',
    'Luigi Knights': 'LuigiKnights-MSS.png',
    'Mario Fireballs': 'MarioFireballs-MSS.png',
    'Peach Monarchs': 'PeachMonarchs-MSS.png',
    'WaluigiSpitballs': 'WaluigiSpitballs-MSS.png',
    'Wario Muscles': 'WarioMuscles-MSS.png',
    'Yoshi Eggs': 'YoshiEggs-MSS.png'
  };

  constructor(
    private leagueService: LeagueCompService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router) {

  }

  private readonly leagueId$ = new BehaviorSubject<string>('');
  readonly isLoading$ = new BehaviorSubject<boolean>(false);
  private profile$ = new BehaviorSubject<any>(null);

  loadRoster(league_id: string) {
    this.setIsLoading(true);
    this.leagueId$.next(league_id);
    this.userId$.next(this.authService.getUserId());

    forkJoin({
      rosters: this.leagueService.getAllRosters(league_id),
      profile: this.leagueService.getProfile(),
      canCreate: this.leagueService.canCreateRoster(league_id, this.userId$.value),

    }).subscribe(({ rosters, profile, canCreate }) => {
      this.rosters$.next(rosters);
      this.profile$.next(profile);
      this.canCreateRoster$.next(canCreate);
      this.selectedRoster$.next(rosters[this.rosterIndex$.value]);
      console.log(this.selectedRoster$.value);
      this.setIsLoading(false);
    })

  }



  createRoster(newRosterName: string, selectedTeamPicture: string) {
    this.creatingRoster$.next(true);
    if (!this.leagueId$.value || !this.userId$.value) {
      console.error('Missing leagueId or userId');
      return;
    }
    this.leagueService.rosterCreate(this.leagueId$.value!, newRosterName, selectedTeamPicture, this.userId$.value, this.profile$.value.username).subscribe({
      next: roster => {
        console.log('Roster created:', roster);
        this.rosters$.next([...this.rosters$.value, roster]);
        this.creatingRoster$.next(false);
        this.canCreateRoster$.next(false);
      },
      error: err => {
        console.error('Error creating roster:', err);
      }
    });


  }

  onRosterClick(roster: any) {
    console.log('Navigating with roster:', roster);
    this.router.navigate([
      '/league-page',
      this.leagueId$.value,
      'teams',
      roster.id
    ]);
  }

  trades() {
    this.router.navigate([
      '/league-page',
      this.leagueId$.value,
      'trades'
    ]);
  }


  setIsLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
  }

  nextRoster() {
    const rosters = this.rosters$.value;
    if (rosters.length === 0) return;
    const nextIndex = (this.rosterIndex$.value + 1) % rosters.length;
    this.rosterIndex$.next(nextIndex);
    this.selectedRoster$.next(rosters[nextIndex]);
  }

  prevRoster() {
    const rosters = this.rosters$.value;
    if (rosters.length === 0) return;
    const prevIndex = (this.rosterIndex$.value - 1 + rosters.length) % rosters.length;
    this.rosterIndex$.next(prevIndex);
    this.selectedRoster$.next(rosters[prevIndex]);
  }




}
