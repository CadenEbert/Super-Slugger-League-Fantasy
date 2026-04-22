import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
    ).then(response => {
      if (response.error) {
        console.error('Error during registration:', response.error);
      } else {
        console.log('Registration successful:', response);
        this.router.navigate(['login']);
      }
    });
  }

}
