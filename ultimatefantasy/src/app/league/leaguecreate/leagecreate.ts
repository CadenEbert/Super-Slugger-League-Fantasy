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

  leagueForm = new FormGroup({
    leagueName:        new FormControl('', Validators.required),
    leagueDescription: new FormControl(''),
    leagueSize:        new FormControl(8, Validators.required),
    draftSettings:     new FormControl('standard', Validators.required),
  });

  constructor(private leagueService: LeagueService) {}

  createLeague() {
    if (this.leagueForm.invalid) return;

    const { leagueName, leagueDescription, leagueSize, draftSettings } = this.leagueForm.value;
    console.log('Creating league:', this.leagueForm.value);
    

    this.leagueService.createLeague({ leagueName, leagueDescription, leagueSize, draftSettings }).subscribe({
      next: (res) => {
        console.log('League created successfully:', res);
        this.leagueForm.reset();
      }
    });

   
  }
}