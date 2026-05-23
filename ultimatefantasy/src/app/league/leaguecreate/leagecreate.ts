import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LeagueService } from '../league-service';
import { AuthService } from '../../auth/auth-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-leagecreate',
  standalone: false,
  templateUrl: './leagecreate.html',
  styleUrl: './leagecreate.css',
})
export class Leagecreate {

  profile: {
    username: string;
  } | null = null;


  leagueForm = new FormGroup({
    leagueName: new FormControl('', Validators.required),
    roster_size: new FormControl(9, [Validators.required, Validators.min(9), Validators.max(13)]),
    leagueSize: new FormControl(8, [Validators.required, Validators.min(2), Validators.max(8)]),
  });

  constructor(private leagueService: LeagueService, public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (!this.authService.currentSession) {
      this.router.navigate(['']);
      return;
    }

    this.leagueService.getProfile().subscribe((profile: any) => {
      this.profile = profile;
    });
  }

  createLeague() {
    if (this.leagueForm.invalid) return;

    const { leagueName, roster_size, leagueSize } = this.leagueForm.value;

    this.leagueService.createLeague(
      leagueName ?? '',
      Number(roster_size ?? 9),
      Number(leagueSize ?? 8)
    ).subscribe({
      next: (res) => {
        console.log('League created successfully:', res);
        alert('League created successfully!');
        this.leagueForm.reset();
      },
      error: (err) => {
        console.error('Error creating league:', err);
        alert('Error creating league: ' + err.message);
      }
    });
  }

  isLoggedIn() {
    return !!this.authService.currentSession;
  }



}
