import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Trade } from '../../../../core/models/trade.model.js'
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  isLoading$ = new BehaviorSubject<boolean>(true);
  requesting$ = new BehaviorSubject<boolean>(false);
  leagueId$ = new BehaviorSubject<string>('');

  trades$ = new BehaviorSubject<any[]>([]);
  members$ = new BehaviorSubject<any[]>([]);
  characters$ = new BehaviorSubject<any[]>([]);

  receivingTeamId$ = new BehaviorSubject<string>('');
  proposingTeamId$ = new BehaviorSubject<string>('');

  receivingTradeCharacters$ = new BehaviorSubject<Trade[]>([]);
  proposingTradeCharacters$ = new BehaviorSubject<Trade[]>([]);

  propAdded$ = new BehaviorSubject<boolean>(false);
  recAdded$ = new BehaviorSubject<boolean>(false);

  requestedPlayerId$ = new BehaviorSubject<string>('');
  offeredPlayerId$ = new BehaviorSubject<string>('');

  proposingTeamPlayers$ = new BehaviorSubject<any[]>([]);
  receivingTeamPlayers$ = new BehaviorSubject<any[]>([]);

  pastTrades$ = new BehaviorSubject<any[]>([]);
  allCharacters$ = new BehaviorSubject<any[]>([]);

  myRosters$ = new BehaviorSubject<any[]>([]);
  rosters$ = new BehaviorSubject<any[]>([]);
  otherRosters$ = new BehaviorSubject<any[]>([]);
  profile$ = new BehaviorSubject<any>(null);


  constructor(private http: HttpClient) {}

  loadTrades(leagueId: string) {
    this.leagueId$.next(leagueId);

  }

  ngOnInit(): void {
    const leagueId = this.route.parent?.snapshot.params['leagueId'];
    this.leagueCompService.getTrades(this.route.parent?.snapshot.params['leagueId']).subscribe(trades => {
      if (trades.length === 0) {
        console.log('No trades found for league:', leagueId);
        this.isLoading = false;
        this.cdr.detectChanges();
      } else {
        console.log('Fetched trades:', trades);
        this.trades = trades;
        this.pastTrades = this.trades.filter(trade => trade.status !== 'pending');
        this.trades = this.trades.filter(trade => trade.status === 'pending');
        this.isLoading = false;
        this.cdr.detectChanges();
      }


    }, error => {
      console.error('Error fetching trades:', error);
    });




    this.leagueCompService.getAllCharacters(this.route.parent?.snapshot.params['leagueId']).subscribe(characters => {
      if (characters.length === 0) {
        console.log('No characters found');
      } else {
        console.log('Fetched characters:', characters);
        this.leagueCompService.getAllCharacterNames().subscribe(characterNames => {
          const characterMap = new Map(characterNames.map((char: any) => [char.ID, char.character_name]));
          console.log('Character map:', characterMap);
          console.log('First character object:', characters[0]);
          this.characters = characters.map((char: any) => ({
            ...char,
            name: characterMap.get(char.character_id) || 'Unknown Character'
          }));
          console.log('Characters after mapping names:', this.characters);
          this.populateProposingTeamPlayers();
          console.log('Characters with names:', this.characters);
          this.isLoading = false;
          this.cdr.detectChanges();
        }, error => {
          console.error('Error fetching character names:', error);
        });



        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, error => {
      console.error('Error fetching characters:', error);
    });

    this.leagueCompService.getAllMembers(leagueId).subscribe(members => {

      if (members.length === 0) {
        console.log('No members found for league:', leagueId);
      } else {
        console.log('Fetched members:', members);
        this.members = members;

        this.leagueCompService.getProfile().subscribe(profile => {
          if (!profile) {
            console.log('No profile found');
          } else {
            console.log('Fetched profile:', profile);
            this.profile = profile;


            this.members = this.members.filter((member: any) => member.user_id !== this.profile.user_id);
            this.profile = profile;

            this.leagueCompService.getAllTradeMembers(leagueId).subscribe(rosters => {
              if (rosters.length === 0) {
                console.log('No trade members found for league:', leagueId);
              } else {
                console.log('Fetched trade members:', rosters);
                this.rosters = rosters;
                this.myRosters = this.rosters.filter((r: any) => r.owner_id === this.profile?.user_id);
                this.otherRosters = this.rosters.filter((r: any) => r.owner_id !== this.profile?.user_id);
                this.proposingTeamId = this.myRosters[0]?.id || '';
                this.populateProposingTeamPlayers();
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            }, error => {
              console.error('Error fetching trade members:', error);
            });

            this.populateProposingTeamPlayers();

            this.isLoading = false;
            this.cdr.detectChanges();
          }
        }, error => {
          console.error('Error fetching profile:', error);
        });


        console.log('Filtered members (excluding current user):', this.members);

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, error => {
      console.error('Error fetching members:', error);
    });


}
