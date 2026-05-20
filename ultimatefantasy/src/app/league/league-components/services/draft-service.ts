import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { io, Socket } from 'socket.io-client';
import { Observable, map, distinctUntilChanged, combineLatest, Subscription, forkJoin } from 'rxjs';
import { DraftState, DraftPick, playerPool, CharacterStats, DraftedPlayer } from '../../../core/models/draft.model';
import { LeagueService } from '../../league-service';
import { AuthService } from '../../../auth/auth-service';
import { moveItemInArray } from '@angular/cdk/drag-drop';


@Injectable({
  providedIn: 'root',
})
export class DraftService implements OnDestroy {
  private socket: Socket;

  private draftDataSubject = new BehaviorSubject<DraftState | null>(null);
  draftData$: Observable<DraftState | null> = this.draftDataSubject.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  private draftPlayersSubject = new BehaviorSubject<DraftPick[]>([]);
  draftPlayers$: Observable<DraftPick[]> = this.draftPlayersSubject.asObservable();

  public pickOrderSubject = new BehaviorSubject<string[]>([]);
  pickOrder$: Observable<string[]> = this.pickOrderSubject.asObservable();

  private characterStatsSubject = new BehaviorSubject<CharacterStats[]>([]);
  characterStats$: Observable<CharacterStats[]> = this.characterStatsSubject.asObservable();

  private playerPoolSubject = new BehaviorSubject<playerPool[]>([]);
  playerPool$: Observable<playerPool[]> = this.playerPoolSubject.asObservable();

  public canDraft$ = new BehaviorSubject<boolean>(false);
  canDraftObservable$ = this.canDraft$.asObservable();

  public isOwner$ = new BehaviorSubject<boolean>(false);
  public isOwnerObservable$ = this.isOwner$.asObservable();

  public userId$ = new BehaviorSubject<any>('');
  public user_id = this.userId$.asObservable();

  public isLoading$ = new BehaviorSubject<boolean>(true);
  public isLoadingObservable$ = this.isLoading$.asObservable();

  public memberMap: { [id: string]: string } = {};

  availablePlayers$: Observable<CharacterStats[]> = combineLatest([
    this.draftDataSubject,
    this.characterStatsSubject
  ]).pipe(
    map(([draftData, characters]) => {

      if (!draftData) return [];
      const pool = draftData.player_pool as unknown as number[];
      return characters.filter(c => pool.includes(Number(c.id)));
    })
  );

  draftedPlayersWithStats$: Observable<DraftedPlayer[]> = combineLatest([this.draftPlayersSubject, this.characterStatsSubject]).pipe(
    map(([picks, characterStats]) =>
      picks
        .map(pick => {
          const character = characterStats.find(c => Number(c.id) === Number(pick.character_picked));
          if (!character) return null;

          return {

            character,
            member_picking: pick.member_picking,
            pick_number: pick.pick_number
          };
        })
        .filter((p): p is DraftedPlayer => p !== null)
        .sort((a, b) => a.pick_number - b.pick_number)
    )
  );

  

  private ownerIdSubject = new BehaviorSubject<string>('');
  ownerId$ = this.ownerIdSubject.asObservable();

  private currentDraftIdSubject = new BehaviorSubject<string>('');
  currentDraftId$ = this.currentDraftIdSubject.asObservable();


  game$ = new BehaviorSubject<any>(null);

  private draftSubscriptions: Subscription[] = [];



  constructor(private http: HttpClient, private leagueService: LeagueService, private authService: AuthService) {
    this.socket = io('http://localhost:3000');
    this.setUserId(this.authService.getUserId());



  }

  setUserId(user_id: string) {

    this.userId$.next(user_id);

  }

  public loadDraft(leagueId: string) {
    this.getDraftId(leagueId).subscribe(draftId => {
      this.setDraftId(draftId);
      this.cleanupDraft(draftId);

      forkJoin({
        draft: this.http.get(`/api/leagues/${leagueId}/draft`),
        members: this.http.get<{ members: any[] }>(`/api/league/${leagueId}/draft/members`),
        players: this.getPlayers(),
        canDraft: this.canDraft(leagueId),
        ownerId: this.leagueService.getOwnerId(leagueId),
        draftPlayers: this.getDraftPlayers(draftId)
      }).subscribe(({ draft, members, players, canDraft, ownerId, draftPlayers }) => {
        this.setDraftData(draft);
        this.setMembers(members.members);
        if ((draft as any).status === 'not_started') {
          this.setPickOrder(members.members);
        } else {
          this.pickOrderSubject.next((draft as any).pick_order);
        }

        this.setCharacterStats(players.players);
        this.setDraftPlayers(draftPlayers.players);
        this.setCanDraft(canDraft);
        this.setOwnerId(ownerId);
        this.setIsOwner(this.userId$.value, ownerId);

        const draftSub = this.onDraftUpdate(draftId).subscribe(update => {
          this.setDraftData(update.new);
        });

        const playersSub = this.onDraftPlayersUpdate(draftId).subscribe(() => {
          setTimeout(() => {
            this.getDraftPlayers(draftId).subscribe({
              next: (data) => this.setDraftPlayers(data.players)
            });
          }, 500);
        });

        this.joinDraft(draftId);
        this.draftSubscriptions.push(draftSub, playersSub);
        this.setIsLoading(false);
      });
    });
  }



  ngOnDestroy(): void {
    this.cleanupDraft(this.currentDraftIdSubject.value);
    this.socket.disconnect();
  }

  public cleanupDraft(draft_id: string) {
    this.draftSubscriptions.forEach(sub => sub.unsubscribe());
    this.draftSubscriptions = [];

    this.socket.off(`draftUpdate:${draft_id}`);
    this.socket.off(`draftPlayersUpdate:${draft_id}`);
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
  }

  setDraftId(draft_id: string) {
    this.currentDraftIdSubject.next(draft_id);
  }

  setOwnerId(ownerId: string) {
    this.ownerIdSubject.next(ownerId);
  }

  setIsOwner(user_id: string, owner_id: string) {
    if (user_id === owner_id) {
      this.isOwner$.next(true);
    } else {
      this.isOwner$.next(false);
    }
  }

  setCanDraft(canDraft: boolean) {
    this.canDraft$.next(canDraft);
  }


  setDraftData(data: any) {

    this.draftDataSubject.next(data);

  }

  setPickOrder(data: any[]) {
    const user_ids = data.map(m => m.user_id);
    this.pickOrderSubject.next(user_ids);
  }

  setPlayerPool(data: any[]) {
    const mappedPool: playerPool[] = data.map((p: any) => ({
      id: p.id,
      name: p.name
    }));
    this.playerPoolSubject.next(mappedPool);
  }

  setDraftPlayers(players: DraftPick[]) {
    this.draftPlayersSubject.next(players);
  }



  getInitialDraftData(leagueId: string): Observable<any> {
    return this.http.get(`/api/leagues/${leagueId}/draft`);
  }

  setDraftDataPlayerList(data: any[]) {
    this.pickOrderSubject.next(data);
  }

  getDraftId(leagueId: string): Observable<string> {
    return this.http.get<{ draftId: string }>(`/api/league/${leagueId}/draftId`).pipe(
      map(response => response.draftId)
    );

  }

  setCharacterStats(players: any[]) {
    const mapped: CharacterStats[] = players.map(player => ({
      id: player.id,
      character_image: player.character_image,
      character_name: player.name,
      weight: player.weight,
      captain: player.captain,
      bunting: player.bunting,
      speed: player.speed,
      fielding: player.fielding,
      curve: player.curve,
      traj: player.trajectory,
      stamina: player.stamina,
      pitching_arm: player.pitchingArm,
      batting_arm: player.battingArm,
      character_class: player.characterClass,
      star_pitch: player.starPitch,
      fielding_ability: player.fieldingAbility,
      star_swing: player.starSwing,
      baserunning_ability: player.baserunningAbility,
      slap_size: player.slapSize,
      charge_size: player.chargeSize,
      slap_power: player.slapPower,
      charge_power: player.chargePower,
      outfield_throwing: player.outfieldThrowing,
      displayed_pitching: player.displayedPitching,
      displayed_batting: player.displayedBatting,
      displayed_fielding: player.displayedFielding,
      dis_speed: player.displayedSpeed,
      curveball_speed: player.curveball_speed,
      charge_pitch_speed: player.chargePitchSpeed,
      hit_curve: player.hitCurve,
      star_pitch_type: player.starPitchType,
    }));

    this.characterStatsSubject.next(mapped);
  }

  setMembers(members: any[]) {
    members.forEach(member => {
      this.memberMap[member.user_id] = member.username;
    });
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

  canDraft(leagueId: string): Observable<boolean> {
    return this.http.get<{ canDraft: boolean }>(`/api/draft/${leagueId}/can-draft`).pipe(
      map(response => response.canDraft)
    );
  }

  reorderPickOrder(previousIndex: number, currentIndex: number) {
    const order = [...this.pickOrderSubject.value];
    moveItemInArray(order, previousIndex, currentIndex);
    this.pickOrderSubject.next(order);
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

  updateDraftData(data: any): Observable<any> {
    return this.http.put(`/api/draft/${this.currentDraftIdSubject.value}/update`, data);
  }


  startDraftTimer(timerSeconds: number): Observable<any> {
    return this.http.post(`/api/draft/${this.currentDraftIdSubject.value}/start`, { timerSeconds });
  }

  pauseDraftTimer(): Observable<any> {
    return this.http.post(`/api/draft/${this.currentDraftIdSubject.value}/pause`, {});
  }

  getPlayerPool(): Observable<any> {
    return this.http.get(`/api/draft/${this.currentDraftIdSubject.value}/playerpool`);
  }

  getPlayers(): Observable<any> {
    return this.http.get(`/api/players`);
  }

  makeDraftPick(characterId: number, memberPicking: string): Observable<any> {
    return this.http.post(`/api/draft/${this.currentDraftIdSubject.value}/pick`, { characterId, memberPicking });
  }
}

