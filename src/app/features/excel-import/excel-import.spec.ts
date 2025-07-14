import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelImport } from './excel-import';

describe('ExcelImport', () => {
  let component: ExcelImport;
  let fixture: ComponentFixture<ExcelImport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelImport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelImport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
