import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { EditMachineComponent } from './edit-machine';
import { MachineService } from '../../core/services/machine';
import { DatabaseService } from '../../core/services/database';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';

describe('EditMachineComponent', () => {
  let component: EditMachineComponent;
  let fixture: ComponentFixture<EditMachineComponent>;
  let mockMachineService: jasmine.SpyObj<MachineService>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockMachineService = jasmine.createSpyObj('MachineService', [
      'getMachineById',
      'updateMachine',
      'isNameUnique',
    ]);
    mockDatabaseService = jasmine.createSpyObj('DatabaseService', [
      'initializeDatabase',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ area: 'costura', id: '1' }),
    };

    await TestBed.configureTestingModule({
      imports: [
        EditMachineComponent,
        ReactiveFormsModule,
        TouchButtonComponent,
      ],
      providers: [
        { provide: MachineService, useValue: mockMachineService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditMachineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with machine data', () => {
    const mockMachine = {
      id: 1,
      name: 'Test Machine',
      area: 'costura' as const,
    };

    mockDatabaseService.initializeDatabase.and.returnValue(Promise.resolve());
    mockMachineService.getMachineById.and.returnValue(of(mockMachine));

    component.ngOnInit();

    expect(component.machineForm.get('name')?.value).toBe('');
  });

  it('should validate form fields', () => {
    expect(component.machineForm.get('name')?.valid).toBeFalsy();

    component.machineForm.patchValue({ name: 'Test Machine' });
    expect(component.machineForm.get('name')?.valid).toBeTruthy();
  });

  it('should navigate back when goBack is called', () => {
    component.selectedArea = 'costura';
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/machines', 'costura']);
  });
});
