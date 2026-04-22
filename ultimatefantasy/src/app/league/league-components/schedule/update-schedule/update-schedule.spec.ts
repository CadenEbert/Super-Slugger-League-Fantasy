import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSchedule } from './update-schedule';

describe('UpdateSchedule', () => {
  let component: UpdateSchedule;
  let fixture: ComponentFixture<UpdateSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateSchedule],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
