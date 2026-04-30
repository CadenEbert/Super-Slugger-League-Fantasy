import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const session = this.authService.currentSession; 

    if (!session?.access_token) {
      return next.handle(req);
    }

    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${session.access_token}`)
    });
    return next.handle(cloned);
  }
}