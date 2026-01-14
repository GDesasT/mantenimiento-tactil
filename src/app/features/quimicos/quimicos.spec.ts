import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuimicosComponent } from './quimicos';

describe('QuimicosComponent', () => {
  let component: QuimicosComponent;
  let fixture: ComponentFixture<QuimicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuimicosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuimicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
