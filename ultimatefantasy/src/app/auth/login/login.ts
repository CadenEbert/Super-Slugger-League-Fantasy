import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
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

    this.authService.login(rawFormData.email, rawFormData.password).subscribe(response => {
      if (response.error) {
        console.error('Error during login:', response.error);
      } else {
        console.log('Login successful:', response);
        this.router.navigate(['']);
        
      }
    });
  }
}
