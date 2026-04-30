import { ChangeDetectorRef, Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LeagueService } from '../league-service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map } from 'rxjs/internal/operators/map';
import { LeagueCompService } from '../league-components/league-comp-service';



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

  private userIdSubject = new BehaviorSubject<string>('');
  userId$ = this.userIdSubject.asObservable();

  constructor(
    private route: ActivatedRoute,
    private leagueService: LeagueService,
    private cdr: ChangeDetectorRef,
    private leagueCompService: LeagueCompService
  

  ) {

  }

  ngOnInit() {

    this.leagueCompService.getUserIdFromBackend().subscribe({
      next: (userId) => {
        this.setUserId(userId);
        console.log('Fetched user ID in LeaguePage:', userId);
      },
      error: (err) => console.error('Error fetching user ID in LeaguePage:', err)
    });




    console.log('User ID in RosterPage:', this.userId$);

    this.leagueService.getOwnerId(this.route.snapshot.params['leagueId']).subscribe(ownerId => {
      console.log('Owner ID in LeaguePage:', ownerId);
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



  private fetchLeague(leagueId: string) {
    this.leagueService.fetchLeagueDetails(leagueId).subscribe({
      next: data => {
        this.league = data;
        this.cdr.detectChanges();
      },
      error: err => console.error('Failed to fetch league:', err)
    });
  }

  setOwnerId(ownerId: string) {
    this.ownerIdSubject.next(ownerId);
  }

  setUserId(userId: string) {
    this.userIdSubject.next(userId);
  }


}


