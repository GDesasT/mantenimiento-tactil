import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TouchButton } from './touch-button';

describe('TouchButton', () => {
  let component: TouchButton;
  let fixture: ComponentFixture<TouchButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TouchButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TouchButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
