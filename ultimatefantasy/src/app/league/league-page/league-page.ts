import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeagueService } from '../league-service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../../auth/auth-service';
import { Subscription, combineLatest } from 'rxjs';
import { Router } from '@angular/router';




@Component({
  selector: 'app-league-page',
  standalone: false,
  templateUrl: './league-page.html',
  styleUrl: './league-page.css',
})
export class LeaguePage {
  league: any = null;
  @Input() leagueId: string | null = null;

  private ownerIdSubject = new BehaviorSubject<string>('');
  ownerId$ = this.ownerIdSubject.asObservable();

  private subscription!: Subscription;
  user_id: string = '';



  constructor(
    private route: ActivatedRoute,
    private leagueService: LeagueService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router


  ) {

  }

  ngOnInit() {

    this.subscription = combineLatest([
      this.authService.isLoggedIn$,
      this.leagueService.user_id
    ]).subscribe(([loggedIn, userId]) => {
      if (!loggedIn) {
        this.router.navigate(['']);
      }
      this.user_id = userId;
    });






    this.leagueService.getOwnerId(this.route.snapshot.params['leagueId']).subscribe(ownerId => {
      this.setOwnerId(ownerId);
    });

    if (this.leagueId) {
      this.fetchLeague(this.leagueId);
    } else {

      this.route.paramMap.subscribe(params => {
        const leagueId = params.get('leagueId');
        if (leagueId) {
          this.fetchLeague(leagueId);
        } else {
          console.error('No league ID found in route');
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }



  private fetchLeague(leagueId: string) {
    this.leagueService.fetchLeagueDetails(leagueId).subscribe({
      next: data => {
        this.league = data;
        this.cdr.detectChanges();
      },
      error: err => console.error('Failed to fetch league:', err)
    });
  }

  isLoggedIn() {
    return !!this.authService.currentSession;
  }


  setOwnerId(ownerId: string) {
    this.ownerIdSubject.next(ownerId);
  }




}


