import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rosters } from './rosters';

describe('Rosters', () => {
  let component: Rosters;
  let fixture: ComponentFixture<Rosters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Rosters],
    }).compileComponents();

    fixture = TestBed.createComponent(Rosters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
