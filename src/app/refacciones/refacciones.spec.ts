import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Refacciones } from './refacciones';

describe('Refacciones', () => {
  let component: Refacciones;
  let fixture: ComponentFixture<Refacciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Refacciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Refacciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
