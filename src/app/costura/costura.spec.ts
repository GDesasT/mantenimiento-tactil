import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Costura } from './costura';

describe('Costura', () => {
  let component: Costura;
  let fixture: ComponentFixture<Costura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Costura]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Costura);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
