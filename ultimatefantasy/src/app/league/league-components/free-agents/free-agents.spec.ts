import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeAgents } from './free-agents';

describe('FreeAgents', () => {
  let component: FreeAgents;
  let fixture: ComponentFixture<FreeAgents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreeAgents],
    }).compileComponents();

    fixture = TestBed.createComponent(FreeAgents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
