import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, distinctUntilChanged, map, Observable, filter } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sessionSubject = new BehaviorSubject<any>(
    localStorage.getItem('session') ? JSON.parse(localStorage.getItem('session')!) : undefined
  );
  session$ = this.sessionSubject.asObservable();

  

 


  constructor(private http: HttpClient) { 
  }

  setSession(session: any) {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session));
      this.sessionSubject.next(session);
    } else {
      localStorage.removeItem('session');
      this.sessionSubject.next(null); 
    }
  }

  getUserId(): any {
    return this.sessionSubject.value.user.id;
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
