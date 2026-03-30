import { ChangeDetectorRef, Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeagueService } from '../league-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-league-page',
  standalone: false,
  templateUrl: './league-page.html',
  styleUrl: './league-page.css',
})
export class LeaguePage {


  league: any = null;
  @Input() leagueId: string | null = null;


  constructor(private route: ActivatedRoute, private leagueService: LeagueService,
     private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const leagueId = this.leagueId || this.route.snapshot.paramMap.get('leagueId');
    if (leagueId) {
      this.leagueService.fetchLeagueDetails(leagueId).subscribe(
        data => {
          this.league = data;
          this.cdr.detectChanges();
        },
        error => console.error('Failed to fetch league:', error)
      );
    } else {
      console.error('No league ID found in route');
    }
  }
}
