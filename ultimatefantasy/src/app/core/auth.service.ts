import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthResponse, createClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { SupabaseService } from './supabase';  


@Injectable({
  providedIn: 'root',   
})

export class AuthService {

    constructor(private supabase: SupabaseService) {}

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
}