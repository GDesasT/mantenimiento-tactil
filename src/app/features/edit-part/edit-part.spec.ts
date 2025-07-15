import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPart } from './edit-part';

describe('EditPart', () => {
  let component: EditPart;
  let fixture: ComponentFixture<EditPart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
