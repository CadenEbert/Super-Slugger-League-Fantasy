import { TestBed } from '@angular/core/testing';

import { RosterPageService } from './roster-page-service';

describe('RosterPageService', () => {
  let service: RosterPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RosterPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
