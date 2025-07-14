import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartCategorySelector } from './part-category-selector';

describe('PartCategorySelector', () => {
  let component: PartCategorySelector;
  let fixture: ComponentFixture<PartCategorySelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartCategorySelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartCategorySelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
