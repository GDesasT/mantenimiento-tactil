import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chemicals } from './chemicals';

describe('Chemicals', () => {
  let component: Chemicals;
  let fixture: ComponentFixture<Chemicals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chemicals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chemicals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
