import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthResponse, createClient, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { SupabaseService } from '../backend/supabase';  


@Injectable({
  providedIn: 'root',   
})

export class AuthService {

    
    private sessionSubject = new BehaviorSubject<Session | null>(null);
    private userSubject = new BehaviorSubject<any>(null);

    session$ = this.sessionSubject.asObservable();
    user$ = this.userSubject.asObservable();

    constructor(private supabase: SupabaseService) {
        this.supabase.client.auth.getSession().then(({ data: { session } }) => {
            console.log('🔑 getSession result:', session);
            this.sessionSubject.next(session);
            this.userSubject.next(session?.user || null);
        });

        this.supabase.client.auth.onAuthStateChange((event, session) => {
            console.log('🔄 onAuthStateChange:', event, session);
            this.sessionSubject.next(session);
            this.userSubject.next(session?.user || null);
        });
    }

    get currentUser() {
        return this.userSubject.value;
    }

    get isLoggedIn() {
        return !!this.userSubject.value;
    }

    signUp(email: string, password: string, username: string): Observable<AuthResponse> {

        
            const promise = this.supabase.client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });
        return from(promise);
        
    }

    login(email: string, password: string): Observable<AuthResponse> {
        const promise = this.supabase.client.auth.signInWithPassword({
            email,
            password,
        });
        return from(promise);
    }

    getUserId(): string | null {
        return this.userSubject.value?.id || null;
    }
}