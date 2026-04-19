import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LeagueService } from '../league-service';

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
    leagueSize: new FormControl(8, Validators.required),
    draftSettings: new FormControl('Standard', Validators.required),
  });

  constructor(private leagueService: LeagueService) { }

  ngOnInit(): void {
    this.leagueService.getProfile().subscribe((profile: any) => {
      this.profile = profile;
      console.log('Profile data:', profile);
    });
  }

  createLeague() {
    if (this.leagueForm.invalid) return;

    const { leagueName, roster_size, leagueSize, draftSettings } = this.leagueForm.value;

    this.leagueService.createLeague({
      leagueName: leagueName ?? '',
      roster_size: Number(roster_size ?? 9),
      leagueSize: Number(leagueSize ?? 8),
      draftSettings: draftSettings ?? 'Standard',

      userName: this.profile?.username ?? ''
     }).subscribe({
      next: (res) => {
        console.log('League created successfully:', res);
        this.leagueForm.reset();
      }
    });
  }

  


  }
