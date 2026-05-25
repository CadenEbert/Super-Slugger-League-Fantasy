import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import PROFANE_WORDS from 'profane-words';

function checkValue(value: unknown): boolean {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return PROFANE_WORDS.some(word => lower.includes(word));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some(v => checkValue(v));
  }
  return false;
}

@Injectable()
export class FilterInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.body && checkValue(req.body)) {
      return throwError(() => new Error('Inappropriate content detected.'));
    }
    return next.handle(req);
  }
}