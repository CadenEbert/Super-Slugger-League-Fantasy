import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Leaguejoin } from './leaguejoin';

describe('Leaguejoin', () => {
  let component: Leaguejoin;
  let fixture: ComponentFixture<Leaguejoin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Leaguejoin],
    }).compileComponents();

    fixture = TestBed.createComponent(Leaguejoin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
