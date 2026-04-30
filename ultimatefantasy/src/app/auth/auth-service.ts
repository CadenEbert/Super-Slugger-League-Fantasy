import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sessionSubject = new BehaviorSubject<any>(null);
  session$ = this.sessionSubject.asObservable();


  constructor(private http: HttpClient) { }

  setSession(session: any) {
    this.sessionSubject.next(session);
  }


  get currentSession() {
    return this.sessionSubject.value;
  }

  signUp(email: string, password: string, username: string): Observable<any> {
    return this.http.post('/api/auth/signup', { email, password, username });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/login', { email, password });
  }
}
