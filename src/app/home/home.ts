import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaintenanceService } from '../services/maintenance';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  constructor(
    private router: Router,
    private maintenanceService: MaintenanceService
  ) {}

  selectFunction(funcion: string) {
    this.maintenanceService.updateSelection({ selectedFunction: funcion });
    this.router.navigate([`/${funcion}`]);
  }
}
