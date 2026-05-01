import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRoster } from './update-roster';

describe('UpdateRoster', () => {
  let component: UpdateRoster;
  let fixture: ComponentFixture<UpdateRoster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateRoster],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateRoster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
