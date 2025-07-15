import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartList } from './part-list';

describe('PartList', () => {
  let component: PartList;
  let fixture: ComponentFixture<PartList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
