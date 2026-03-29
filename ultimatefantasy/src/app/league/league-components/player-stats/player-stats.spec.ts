import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerStats } from './player-stats';

describe('PlayerStats', () => {
  let component: PlayerStats;
  let fixture: ComponentFixture<PlayerStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerStats],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
