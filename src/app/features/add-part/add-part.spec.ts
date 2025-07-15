import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPart } from './add-part';

describe('AddPart', () => {
  let component: AddPart;
  let fixture: ComponentFixture<AddPart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
