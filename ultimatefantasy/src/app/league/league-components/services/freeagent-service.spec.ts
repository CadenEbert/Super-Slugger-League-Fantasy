import { TestBed } from '@angular/core/testing';

import { FreeagentService } from './freeagent-service';

describe('FreeagentService', () => {
  let service: FreeagentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreeagentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
