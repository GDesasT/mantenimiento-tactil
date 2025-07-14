import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <nav class="professional-nav">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="nav-brand">
              <img src="logo.svg" alt="Global Safety Textiles" class="h-8" />
            </div>

            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-600">
                <span class="font-medium">Tool Room</span> •
                <span>Industrial Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido principal -->
      <main class="container mx-auto px-6 py-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer profesional -->
      <footer class="bg-gray-800 text-white py-6 mt-12">
        <div class="container mx-auto px-6 text-center">
          <p class="text-sm">
            © 2024 Sistema de Mantenimiento Industrial.
            <span class="text-gray-400"
              >Desarrollado para Tool Room Management</span
            >
          </p>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent {
  title = 'mantenimiento-tactil';
}
