import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaguePage } from './league-page';

describe('LeaguePage', () => {
  let component: LeaguePage;
  let fixture: ComponentFixture<LeaguePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeaguePage],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaguePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
