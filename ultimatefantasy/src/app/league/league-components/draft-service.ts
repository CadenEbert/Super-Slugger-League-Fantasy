import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { io, Socket } from 'socket.io-client';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  private socket: Socket;



  game$ = new BehaviorSubject<any>(null);



  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000');
  }

  getInitialDraftData(leagueId: string): Observable<any> {
    return this.http.get(`/api/leagues/${leagueId}/draft`);
  }

  getDraftId(leagueId: string): Observable<string> {
    return this.http.get<{ draftId: string }>(`/api/league/${leagueId}/draftId`).pipe(
      map(response => response.draftId)
    );
  }


  joinDraft(draftId: string) {
    this.socket.emit('joinDraft', draftId);
  }

  onDraftUpdate(draftId: string): Observable<any> {
    return new Observable(observer => {
      const eventName = `draftUpdate:${draftId}`; 
      this.socket.on(eventName, (data) => {
        observer.next(data);
      });
  
      return () => {
        this.socket.off(eventName);
      };
    });
  }

  onDraftPlayersUpdate(draftId: string): Observable<any> {
    return new Observable(observer => {
      const eventName = `draftPlayersUpdate:${draftId}`;
      this.socket.on(eventName, (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.off(eventName);
      };
    });
  }

  getDraftPlayers(draftId: string): Observable<any> {
    return this.http.get(`/api/draft/${draftId}/players`);
  }
  
  getDraftData(draftId: string): Observable<any> {
    return this.http.get<any>(`/api/draft/${draftId}`);
  }

  subscribeToDraftUpdates(draftId: string): void {
    this.http.post(`/api/draft/${draftId}/join`, {}).subscribe({
      next: () => console.log('Subscribed'),
      error: (err) => console.error(err)
    });
  }

  getAllLeagueMembers(leagueId: string): Observable<any[]> {
    return this.http.get<{ members: any[] }>(`/api/league/${leagueId}/draft/members`).pipe(
      map(response => response.members)
    );
  }

  updateDraftData(draftId: string, data: any): Observable<any> {
    return this.http.put(`/api/draft/${draftId}/update`, data);
  }

 
  startDraftTimer(draftId: string, timerSeconds: number): Observable<any> {
    return this.http.post(`/api/draft/${draftId}/start`, { timerSeconds});
  }

  pauseDraftTimer(draftId: string): Observable<any> {
    return this.http.post(`/api/draft/${draftId}/pause`, {});
  }

  getPlayerPool(draftId: string): Observable<any> {
    return this.http.get(`/api/draft/${draftId}/playerpool`);
  }

  getPlayers(): Observable<any> {
    return this.http.get(`/api/players`);
  }
}

