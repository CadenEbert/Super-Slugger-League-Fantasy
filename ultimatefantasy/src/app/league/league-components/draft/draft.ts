import { Component, OnDestroy, OnInit } from '@angular/core';
import { DraftService } from '../draft-service';
import { ActivatedRoute } from '@angular/router';
import {  Subscription } from 'rxjs';
import {  take } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LeagueService } from '../../league-service';
import { LeagueCompService } from '../league-comp-service';


@Component({
  selector: 'app-draft',
  standalone: false,
  templateUrl: './draft.html',
  styleUrl: './draft.css',
})
export class Draft implements OnInit, OnDestroy {
  draftId: string = '';
  leagueId: string = '';
  isLoading: boolean = true;
  isMakingPick = false;

  timePerPick: number = 60;
  draftType: string = 'Snake';
  numberOfRounds: number = 10;

  private subscriptions = new Subscription();

  constructor(
    public draftService: DraftService,
    private route: ActivatedRoute,

  ) {}

  ngOnInit() {
    this.leagueId = this.route.parent?.snapshot.params['leagueId'];
    this.draftService.loadDraft(this.leagueId);
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.draftService.cleanupDraft(this.draftId);
  }

  startDraft(timePerPick: number, draftType: string, numberOfRounds: number) {
    const current = this.draftService.draftData$.pipe(take(1)).subscribe(data => {
      if (!data) return;
      this.subscriptions.add(
        this.draftService.updateDraftData(this.draftId, {
          ...data,
          status: 'in_progress',
          current_pick: 1,
          current_round: 1,
          timer_seconds: timePerPick,
          time_per_pick: timePerPick,
          number_of_rounds: numberOfRounds,
          draft_type: draftType,
          pick_order: data.pick_order
        }).subscribe({
          next: () => console.log('Draft started'),
          error: (err) => console.error('Error starting draft:', err)
        })
      );
    });
  }


  drop(event: CdkDragDrop<string[]>) {
    this.draftService.reorderPickOrder(event.previousIndex, event.currentIndex);
  }

  toggleTimer(data: boolean) {
    if (data) {
      this.draftService.pauseDraftTimer(this.draftId).subscribe();
    } else {
      this.draftService.draftData$.pipe(take(1)).subscribe(draftData => {
        if (draftData) {
          this.draftService.startDraftTimer(this.draftId, draftData.timer_seconds).subscribe();
        }
      });
    }
  }

  makePick(characterId: number, memberPicking: string) {
    if (this.isMakingPick) return;
    this.isMakingPick = true;
    this.subscriptions.add(
      this.draftService.makeDraftPick(this.draftId, characterId, memberPicking).subscribe({
        next: () => this.isMakingPick = false,
        error: () => this.isMakingPick = false
      })
    );
  }
}