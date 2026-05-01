import { Component } from '@angular/core';
import { ProfileService } from '../profile-service';
import { AuthService } from '../../auth/auth-service.js';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  profile: any = null;
  session: any = null;
  isLoading: boolean = true;
  newUsername: string = '';

  changingUsername: boolean = false;
  

  constructor(private profileService: ProfileService, private authService: AuthService, private cdr: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.isLoading = true;

    this.session = this.authService.currentSession; 

    
      this.profileService.getProfile().subscribe({
        next: (profileData) => {
          this.profile = profileData;
        
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    
  }

  changeUsername() {
    this.changingUsername = true;
    console.log('Attempting to change username to:', this.newUsername);
    this.profileService.updateUsername(this.newUsername).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.newUsername = '';
        this.changingUsername = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating username:', err);
        this.changingUsername = false;
        this.cdr.detectChanges();
      }
    });


  }


}
