import { TestBed } from '@angular/core/testing';

import { DiaolagService } from './diaolag-service';

describe('DiaolagService', () => {
  let service: DiaolagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaolagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
