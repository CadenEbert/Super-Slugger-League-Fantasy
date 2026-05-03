import { TestBed } from '@angular/core/testing';

import { PlayerstatsService } from './playerstats-service';

describe('PlayerstatsService', () => {
  let service: PlayerstatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerstatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
