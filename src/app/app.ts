import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatabaseService } from './core/services/database';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule], // ← Agregar CommonModule
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm border-b-2 border-gray-200">
        <div class="container mx-auto px-6 py-4">
          <h1 class="text-3xl font-bold text-gray-800">
            🏭 Sistema de Mantenimiento
          </h1>
        </div>
      </header>

      <main class="container mx-auto px-6 py-8">
        <div *ngIf="isInitializing" class="text-center py-20">
          <div class="inline-flex items-center justify-center">
            <span class="text-2xl font-semibold text-gray-700"
              >⏳ Inicializando sistema...</span
            >
          </div>
        </div>

        <router-outlet *ngIf="!isInitializing"></router-outlet>
      </main>
    </div>
  `,
})
export class AppComponent implements OnInit {
  title = 'mantenimiento-tactil';
  isInitializing = true;

  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    try {
      console.log('🚀 Starting application...');
      await this.databaseService.initializeDatabase();
      console.log('✅ Application ready');

      setTimeout(() => {
        this.isInitializing = false;
      }, 1000);
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      this.isInitializing = false;
    }
  }
}
