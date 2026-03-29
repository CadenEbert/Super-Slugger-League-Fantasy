import { TestBed } from '@angular/core/testing';

import { LeagueCompService } from './league-comp-service';

describe('LeagueCompService', () => {
  let service: LeagueCompService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeagueCompService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
