import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Myleagues } from './myleagues';

describe('Myleagues', () => {
  let component: Myleagues;
  let fixture: ComponentFixture<Myleagues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Myleagues],
    }).compileComponents();

    fixture = TestBed.createComponent(Myleagues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
