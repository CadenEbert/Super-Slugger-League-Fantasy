import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  private readonly socket: Socket | null = null;
  

  game$ = new BehaviorSubject<any>(null);



  constructor() {
      this.socket = io('http://localhost:3000'); 
   }

   onDraftUpdate(): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) return;
      
      this.socket.on('draftUpdate', (data: any) => {
        console.log('Received draft update:', data);
        observer.next(data);
      });

      return () => {
        if (this.socket) {
          this.socket.off('draftUpdate');
        }
      };
    });
  }



}
