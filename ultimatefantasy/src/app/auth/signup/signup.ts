import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    const rawFormData = this.form.getRawValue();
    this.authService.signUp(
      rawFormData.email ?? '',
      rawFormData.password ?? '',
      rawFormData.username ?? ''
    ).subscribe({
      next: (response) => {
        if (response.error) {
          console.error('Error during signup:', response.error);
          window.alert('Signup failed: ' + response.error);
          this.router.navigate(['']);
        } else {
          console.log('Signup successful:', response);
          this.authService.setSession({ access_token: response.access_token });
          this.router.navigate(['']);
        }
      },
      error: (err) => {
        console.error('Signup request failed:', err);
      }
    });
    
  }

}
