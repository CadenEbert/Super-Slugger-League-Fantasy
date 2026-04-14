import { ChangeDetectorRef, Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LeagueService } from '../league-service';
import { isPlatformBrowser } from '@angular/common';
import { LeagueCompService } from '../league-components/league-comp-service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-league-page',
  standalone: false,
  templateUrl: './league-page.html',
  styleUrl: './league-page.css',
})
export class LeaguePage {
  league: any = null;
  @Input() leagueId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private leagueService: LeagueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
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
}
