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

  isSubmitting = false;

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const rawFormData = this.form.getRawValue();
    this.authService.signUp(
      rawFormData.email ?? '',
      rawFormData.password ?? '',
      rawFormData.username ?? ''
    ).subscribe({
      next: (response) => {
        if (response.error) {
          this.isSubmitting = false;
          console.error('Error during signup:', response.error);
          window.alert('Signup failed: ' + response.error);
          return;
        }

        if (response.session?.access_token) {
          this.authService.setSession(response.session);
        } else {
          window.alert('Account created. Check your email to confirm your account, then sign in.');
        }

        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Signup request failed:', err);
        window.alert('Signup failed: ' + (err.error?.error ?? 'Unable to create account.'));
      }
    });
    
  }

}
