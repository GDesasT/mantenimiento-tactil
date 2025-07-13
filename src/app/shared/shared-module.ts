import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Importar componente standalone
import { TouchButtonComponent } from './components/touch-button/touch-button';

@NgModule({
  declarations: [
    // No declarar componentes standalone aquí
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Importar componentes standalone
    TouchButtonComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Exportar componentes standalone
    TouchButtonComponent,
  ],
})
export class SharedModule {}
