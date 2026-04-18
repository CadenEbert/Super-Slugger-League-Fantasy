import { Component } from '@angular/core';
import { DraftService } from '../draft-service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService } from '../../../core/auth.service';

export interface DraftState {
  id: string;
  league_id: string;
  status: 'not_started' | 'in_progress' | 'done';
  current_pick: number;
  round: number;
  pick_order: string[];
  current_pick_index: number;
  timer_seconds: number;
  timer_running: boolean;
  player_pool: number[];


}

export interface DraftPick {
  id: string;
  draft_id: string;
  member_id: string;
  player_id: string;
  pick_number: number;
  round: number;

}

export interface playerPool {
  id: number;
  name: string;


}

export interface CharacterStats {
  id: number | string;
  character_name: string;
  weight: number;
  captain: boolean;
  bunting: number;
  speed: number;
  fielding: number;
  curve: number;
  traj: number;
  stamina: number;
  pitching_arm: string;
  batting_arm: string;
  character_class: string;
  star_pitch: string;
  fielding_ability: number;
  star_swing: string;
  baserunning_ability: number;
  slap_size: number;
  charge_size: number;
  slap_power: number;
  charge_power: number;
  outfield_throwing: number;
  displayed_pitching: number;
  displayed_batting: number;
  displayed_fielding: number;
  dis_speed: number;
  curveball_speed: number;
  charge_pitch_speed: number;
  hit_curve: number;
  star_pitch_type: string;
}


@Component({
  selector: 'app-draft',
  standalone: false,
  templateUrl: './draft.html',
  styleUrl: './draft.css',
})
export class Draft {
  private draftDataSubject = new BehaviorSubject<DraftState | null>(null);
  draftData$: Observable<DraftState | null> = this.draftDataSubject.asObservable();
  draftId: string = '';

  private draftPlayersSubject = new BehaviorSubject<DraftPick[]>([]);
  draftPlayers$: Observable<DraftPick[]> = this.draftPlayersSubject.asObservable();

  private pickOrderSubject = new BehaviorSubject<string[]>([]);
  pickOrder$: Observable<string[]> = this.pickOrderSubject.asObservable();

  private characterStatsSubject = new BehaviorSubject<CharacterStats[]>([]);
  characterStats$: Observable<CharacterStats[]> = this.characterStatsSubject.asObservable();

  private playerPoolSubject = new BehaviorSubject<playerPool[]>([]);
  playerPool$: Observable<playerPool[]> = this.playerPoolSubject.asObservable();

  public memberMap: { [id: string]: string } = {};

  private userId = new BehaviorSubject<string>('');
  userId$ = this.userId.asObservable();







  constructor(private draftService: DraftService, private route: ActivatedRoute, private auth: AuthService) { }

  ngOnInit() {
    
    

    this.draftService.getDraftId(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (id) => {
        this.draftId = id;
     
        console.log('Draft ID:', id);
        this.draftService.getDraftPlayers(this.draftId).subscribe({
          next: (data) => {
            this.setDraftPlayers(data.players);


          }
        });
        this.draftService.onDraftUpdate(id).subscribe(update => {
          console.log('Live update:', update);
          this.setDraftData(update.new);
          

        });
        this.draftService.onDraftPlayersUpdate(id).subscribe(update => {
          console.log('Draft players update:', update);
          this.setDraftPlayers(update.new);
        });
        this.draftService.joinDraft(id);

      },
      error: (err) => {
        console.error('Error fetching draft ID:', err);
      }
    });



    this.draftService.getInitialDraftData(this.route.parent?.snapshot.params['leagueId']).subscribe({
      next: (data) => {
        this.setDraftData(data);

        this.draftService.getAllLeagueMembers(this.route.parent?.snapshot.params['leagueId']).subscribe({
          next: (members) => {
            this.setMembers(members);
            console.log('First member object:', JSON.stringify(members[0]));
            this.setUserId(this.auth.getUserId()!);

            this.setDraftDataPlayerList(members.map((m: any) => m.user_id));
        

            console.log('League Members:', members);
            console.log('Member Map:', this.memberMap);
            console.log('Draft Data  after setting members:', this.draftDataSubject.value);

          },
          error: (err) => {
            console.error('Error fetching league members:', err);
          }
        });

      },
      error: (err) => {
        console.error('Error fetching initial draft data:', err);
      }
    });

    this.draftService.getPlayers().subscribe({
      next: (data) => {
        
        this.setCharacterStats(data.players);
       
        

       
      }, error: (err) => {
        console.error('Error fetching character stats:', err);
      }
    });

    

  }

  setDraftData(data: any) {
    this.draftDataSubject.next(data);
  }


  getCharacter(id: number): CharacterStats | undefined {
    return this.characterStatsSubject.value.find(c => c.id === id);
  }

  getAvailablePlayers(draftData: DraftState): CharacterStats[] {
    const pool = draftData.player_pool as unknown as number[];
    return this.characterStatsSubject.value.filter(c => pool.includes(Number(c.id)));
  }
  setDraftPlayers(players: DraftPick[]) {
    this.draftPlayersSubject.next(players);
  }

  setUserId(id: string) {
    this.userId.next(id);
    console.log('User ID set to:', id);
  }

  setCharacterStats(players: any[]) {
    const mapped: CharacterStats[] = players.map(player => ({
      id: player.id,
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

  setDraftDataPlayerList(data: any[]) {
    this.pickOrderSubject.next(data);
  }

  setPlayerPool(data: any[]) {
    const mappedPool: playerPool[] = data.map((p: any) => ({
      id: p.id,
      name: p.name
    }));
    this.playerPoolSubject.next(mappedPool);
  }

  startDraft() {
    const current = this.draftDataSubject.value;
    if (current) {


      console.log(this.pickOrderSubject.value);

      this.draftService.updateDraftData(this.draftId, {
        ...current,
        status: 'in_progress',
        current_pick: 1,
        current_round: 1,
        pick_order: this.pickOrderSubject.value
      }).subscribe({
        next: () => console.log('Draft started'),
        error: (err) => console.error('Error starting draft:', err)

      });
    }
  }


  setMembers(members: any[]) {
    members.forEach(member => {
      this.memberMap[member.user_id] = member.username;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    const order = [...this.pickOrderSubject.value];
    moveItemInArray(order, event.previousIndex, event.currentIndex);
    this.pickOrderSubject.next(order);
  }

  toggleTimer(data: boolean) {
    if (data) {
      this.draftService.pauseDraftTimer(this.draftId).subscribe();
    } else {
      const draftData = this.draftDataSubject.value;
      if (draftData) {
        this.draftService.startDraftTimer(this.draftId, draftData.timer_seconds).subscribe();

      }
    }
  }

  makePick(characterId: number, memberPicking: string) {
    console.log('Making pick:', { characterId, memberPicking });
    
    this.draftService.makeDraftPick(this.draftId, characterId, memberPicking).subscribe({
      next: () => console.log('Pick made'),
      error: (err) => console.error('Error making pick:', err)
    });
  }
}