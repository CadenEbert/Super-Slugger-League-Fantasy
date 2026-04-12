// src/app/core/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';  // adjust path if needed
import { switchMap, take } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('AuthInterceptor intercept() called for:', req.url);
    return this.authService.session$.pipe(
      take(1),
      switchMap(session => {
        if (!session?.access_token) return next.handle(req);

        const cloned = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${session.access_token}`)
        });
        console.log('Attaching Authorization header:', cloned.headers.get('Authorization'));
        return next.handle(cloned);
      })
    );
  }
}