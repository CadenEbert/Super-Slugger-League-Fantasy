import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  private channel: RealtimeChannel | null = null;

  game$ = new BehaviorSubject<any>(null);



  constructor(private http: HttpClient) { }

}
