import { Component, inject } from '@angular/core';
import { AuthService } from '../auth-service';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);

  form = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    const rawFormData = this.form.getRawValue();
    this.authService.login(rawFormData.email ?? '', rawFormData.password ?? '').subscribe({
      next: (response) => {

        this.authService.setSession(response.session); 
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Login request failed:', err);
        if (err.error && err.error.error === 'Invalid login credentials') {
          alert('Invalid email or password. Please try again.');
        } else {
          alert('Login failed: ' + (err.error?.error || err.message));
        }
      }
    });
  }
}