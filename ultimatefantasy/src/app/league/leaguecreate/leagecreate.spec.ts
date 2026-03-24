import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Leagecreate } from './leagecreate';

describe('Leagecreate', () => {
  let component: Leagecreate;
  let fixture: ComponentFixture<Leagecreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Leagecreate],
    }).compileComponents();

    fixture = TestBed.createComponent(Leagecreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
