import { TestBed } from '@angular/core/testing';

import { Part } from './part';

describe('Part', () => {
  let service: Part;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Part);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
