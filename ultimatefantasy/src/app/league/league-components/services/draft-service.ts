import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { io, Socket } from 'socket.io-client';
import { Observable, map, distinctUntilChanged, combineLatest, Subscription, forkJoin, startWith, Subject } from 'rxjs';
import { DraftState, DraftPick, playerPool, CharacterStats, DraftedPlayer } from '../../../core/models/draft.model';
import { LeagueService } from '../../league-service';
import { AuthService } from '../../../auth/auth-service';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class DraftService implements OnDestroy {


  private draftDataSubject = new BehaviorSubject<DraftState | null>(null);
  draftData$: Observable<DraftState | null> = this.draftDataSubject.asObservable();

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

  private supabase: SupabaseClient;
  private activeChannels: Map<string, RealtimeChannel> = new Map();
  private playerFilterSubject = new Subject<string>();

  playerFilter$ = this.playerFilterSubject.asObservable().pipe(
    startWith('All')
  );

  availablePlayers$: Observable<CharacterStats[]> = combineLatest([
    this.draftDataSubject,
    this.characterStatsSubject,
    this.playerFilter$
  ]).pipe(
    map(([draftData, characters, filter]) => {

      if (!draftData) return [];
      const pool = draftData.player_pool as unknown as number[];
      const availablePlayers = characters.filter(c => pool.includes(Number(c.id)));

      if (filter === 'Captains') {
        return availablePlayers.filter(player => player.captain);
      } else if (filter === 'Power Class') {
        return availablePlayers.filter(player => player.character_class?.includes('Power'));
      } else if (filter === 'Technique Class') {
        return availablePlayers.filter(player => player.character_class?.includes('Technique'));
      } else if (filter === 'Speed Class') {
        return availablePlayers.filter(player => player.character_class?.includes('Speed'));
      } else if (filter === 'Balanced Class') {
        return availablePlayers.filter(player => player.character_class?.includes('Balanced'));
      }

      return availablePlayers.sort((a, b) => this.comparePlayers(a, b, filter));
    })
  );

  readonly draftedPlayersWithStats$ = new BehaviorSubject<any[]>([]);



  private ownerIdSubject = new BehaviorSubject<string>('');
  ownerId$ = this.ownerIdSubject.asObservable();

  private currentDraftIdSubject = new BehaviorSubject<string>('');
  currentDraftId$ = this.currentDraftIdSubject.asObservable();


  game$ = new BehaviorSubject<any>(null);

  private draftSubscriptions: Subscription[] = [];



  constructor(private http: HttpClient, private leagueService: LeagueService, private authService: AuthService) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
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
        players: this.getPlayerPool(),
        canDraft: this.canDraft(leagueId),
        ownerId: this.leagueService.getOwnerId(leagueId),
        draftPlayers: this.getDraftPlayers(draftId),
        draftedPlayers: this.leagueService.getDraftedPlayers(draftId),
      }).subscribe(({ draft, members, players, canDraft, ownerId, draftPlayers, draftedPlayers }) => {
        this.setDraftData(draft);
        this.setMembers(members.members);
        if ((draft as any).status === 'not_started') {
          this.setPickOrder(members.members);
        } else {
          this.pickOrderSubject.next((draft as any).pick_order);
        }

        this.draftedPlayersWithStats$.next(draftedPlayers);


        this.setCharacterStats(players.playerPool);
        this.setDraftPlayers(draftPlayers.players);
        this.setCanDraft(canDraft);
        this.setOwnerId(ownerId);
        this.setIsOwner(this.userId$.value, ownerId);



        const draftSub = this.onDraftUpdate(draftId).subscribe(update => {
          this.setDraftData(update.new);
          if (update.new.pick_order) {
            this.pickOrderSubject.next(update.new.pick_order);
          }
        });

        const playersSub = this.onDraftPlayersUpdate(draftId).subscribe(() => {

          forkJoin({
            draftPlayers: this.getDraftPlayers(draftId),
            draftedPlayers: this.leagueService.getDraftedPlayers(draftId)
          }).subscribe(({ draftPlayers, draftedPlayers }) => {

            this.setDraftPlayers(draftPlayers.players);

            this.draftedPlayersWithStats$.next(draftedPlayers);

          });

        });

        this.draftSubscriptions.push(draftSub, playersSub);
        this.setIsLoading(false);

      });
    });
  }



  ngOnDestroy(): void {
    this.cleanupDraft(this.currentDraftIdSubject.value);
  }

  public cleanupDraft(draft_id: string) {
    this.draftSubscriptions.forEach(sub => sub.unsubscribe());
    this.draftSubscriptions = [];

    const draftChannel = this.activeChannels.get(`draft-${draft_id}`);
    if (draftChannel) { draftChannel.unsubscribe(); this.activeChannels.delete(`draft-${draft_id}`); }

    const playersChannel = this.activeChannels.get(`draft-players-${draft_id}`);
    if (playersChannel) { playersChannel.unsubscribe(); this.activeChannels.delete(`draft-players-${draft_id}`); }
  }

  onDraftUpdate(draftId: string): Observable<any> {
    return new Observable(observer => {
      const channelKey = `draft-${draftId}`;
      if (this.activeChannels.has(channelKey)) {
        this.activeChannels.get(channelKey)!.unsubscribe();
      }

      const channel = this.supabase
        .channel(channelKey)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'draft', filter: `uuid=eq.${draftId}` },
          (payload) => observer.next(payload)
        )
        .subscribe((status) => console.log('Draft channel status:', status));

      this.activeChannels.set(channelKey, channel);

      return () => {
        channel.unsubscribe();
        this.activeChannels.delete(channelKey);
      };
    });
  }

  onDraftPlayersUpdate(draftId: string): Observable<any> {
    return new Observable(observer => {
      const channelKey = `draft-players-${draftId}`;
      if (this.activeChannels.has(channelKey)) {
        this.activeChannels.get(channelKey)!.unsubscribe();
      }

      const channel = this.supabase
        .channel(channelKey)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'draft_players', filter: `draft_id=eq.${draftId}` },
          (payload) => observer.next(payload)
        )
        .subscribe((status) => console.log('Draft players channel status:', status));

      this.activeChannels.set(channelKey, channel);

      return () => {
        channel.unsubscribe();
        this.activeChannels.delete(channelKey);
      };
    });
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
    this.draftDataSubject.value;
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
      rank: player.rank,
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

    const sorted = mapped.sort((a, b) => a.rank - b.rank);
    this.characterStatsSubject.next(sorted);
  }

  changePlayerPoolOrder(newOrder: String) {
    this.playerFilterSubject.next(String(newOrder));
  }

  private comparePlayers(a: CharacterStats, b: CharacterStats, category: string): number {
    switch (category) {
      case 'Tier':
        return a.rank - b.rank;
      case 'Speed':
        return b.speed - a.speed;
      default:
        return 0;
    }
  }

  changeDraftedSort(newSort: String) {
    if (newSort === 'All Picks') {
      this.draftedPlayersWithStats$.next(this.draftedPlayersWithStats$.value.sort((a, b) => a.pick_number - b.pick_number));
    } else if (newSort === 'My Team') {
      const myTeamDrafted = this.draftedPlayersWithStats$.value.filter(player => player.member_picking === this.userId$.value);
      this.draftedPlayersWithStats$.next(myTeamDrafted.sort((a, b) => a.pick_number - b.pick_number));
    }
  }

  private compareClass(a: CharacterStats, b: CharacterStats, className: string): number {
    const aMatches = a.character_class?.includes(className) ? 1 : 0;
    const bMatches = b.character_class?.includes(className) ? 1 : 0;

    return bMatches - aMatches || a.rank - b.rank;
  }

  setMembers(members: any[]) {
    members.forEach(member => {
      this.memberMap[member.user_id] = member.username;
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

