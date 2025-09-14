import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeticionesAdmin } from './peticiones-admin';

describe('PeticionesAdmin', () => {
  let component: PeticionesAdmin;
  let fixture: ComponentFixture<PeticionesAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeticionesAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeticionesAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
