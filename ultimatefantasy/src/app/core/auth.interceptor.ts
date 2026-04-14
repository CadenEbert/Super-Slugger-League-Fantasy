// src/app/core/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';  // adjust path if needed
import { filter, switchMap, take } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.session$.pipe(
      filter(session => session !== undefined), 
      take(1),
      switchMap(session => {
        if (!session?.access_token) return next.handle(req);

        const cloned = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${session.access_token}`)
        });
        return next.handle(cloned);
      })
    );
  }
}