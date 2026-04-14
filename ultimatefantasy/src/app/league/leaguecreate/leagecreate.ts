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
    leagueDescription: new FormControl(''),
    leagueSize: new FormControl(8, Validators.required),
    draftSettings: new FormControl('standard', Validators.required),
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

    const { leagueName, leagueDescription, leagueSize, draftSettings } = this.leagueForm.value;

    this.leagueService.createLeague({
      leagueName: leagueName ?? '',
      leagueDescription: leagueDescription ?? '',
      leagueSize: Number(leagueSize ?? 8),
      draftSettings: draftSettings ?? 'standard',
      userName: this.profile?.username ?? ''
     }).subscribe({
      next: (res) => {
        console.log('League created successfully:', res);
        this.leagueForm.reset();
      }
    });
  }

  


  }
