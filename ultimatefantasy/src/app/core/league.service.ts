import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, of } from 'rxjs';
import { SupabaseService } from './supabase';  

@Injectable({
  providedIn: 'root',
})
export class LeagueApiService {
  constructor(private supabase: SupabaseService) {}
  

  getLeaguesForCurrentUser(): Observable<any[]> {
    return from(this.supabase.client.auth.getSession()).pipe(
      switchMap(({ data }) => {
        const userId = data.session?.user?.id;
        console.log('Current user ID:', userId); // Debugging log
        

        if (!userId) {
          return of([]); 
        }

        return from(
          this.supabase.client
            .from('leagues')
            .select('*')
            .eq('owner_id', userId)
        ).pipe(
          map(res => res.data || [])
        );
      })
    );
  }
}