import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TouchButtonComponent } from '../touch-button/touch-button';

@Component({
  selector: 'app-virtual-keyboard',
  standalone: true,
  imports: [CommonModule, TouchButtonComponent],
  template: `
    <div
      class="virtual-keyboard"
      *ngIf="visible"
      (click)="onKeyboardClick($event)"
    >
      <div class="keyboard-container">
        <div class="keyboard-header">
          <app-touch-button
            variant="secondary"
            size="sm"
            icon="✕"
            (clicked)="close()"
            class="close-btn"
          >
          </app-touch-button>
        </div>

        <div class="keyboard-grid">
          <!-- Fila de números -->
          <div class="keyboard-row">
            <button
              *ngFor="let key of keyboardLayout.numbers"
              class="key"
              (click)="typeKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Primera fila de letras -->
          <div class="keyboard-row">
            <button
              *ngFor="let key of keyboardLayout.row1"
              class="key"
              (click)="typeKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Segunda fila de letras -->
          <div class="keyboard-row">
            <button
              *ngFor="let key of keyboardLayout.row2"
              class="key"
              (click)="typeKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Tercera fila de letras -->
          <div class="keyboard-row">
            <button
              *ngFor="let key of keyboardLayout.row3"
              class="key"
              (click)="typeKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Fila de acciones -->
          <div class="keyboard-row">
            <button class="key key-space" (click)="typeKey(' ')">
              Espacio
            </button>
            <button class="key key-backspace" (click)="backspace()">⌫</button>
            <button class="key key-clear" (click)="clear()">Limpiar</button>
            <button class="key key-enter" (click)="enter()" *ngIf="showEnter">
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .virtual-keyboard {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        width: auto;
        max-width: 800px;
        background: transparent;
        border: none;
        border-radius: 1.5rem;
        z-index: 1000;
      }

      .keyboard-container {
        max-width: 750px;
        margin: 0 auto;
        padding: 1rem;
      }

      .keyboard-header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 1rem;
      }

      .close-btn {
        opacity: 0.7;
        transition: opacity 0.2s ease;
      }

      .close-btn:hover {
        opacity: 1;
      }

      .keyboard-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .keyboard-row {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
      }

      .key {
        min-width: 50px;
        height: 60px;
        border: 1px solid rgba(226, 232, 240, 0.4);
        border-radius: 0.75rem;
        background: rgba(247, 250, 252, 0.9);
        backdrop-filter: blur(10px);
        color: #2d3748;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
      }

      .key:hover {
        background: rgba(226, 232, 240, 0.7);
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
      }

      .key:active {
        transform: translateY(0);
        background: rgba(203, 213, 224, 0.8);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      }

      .key-space {
        min-width: 200px;
      }

      .key-backspace,
      .key-clear {
        min-width: 90px;
        background: rgba(254, 215, 215, 0.9);
        color: #c53030;
      }

      .key-backspace:hover,
      .key-clear:hover {
        background: rgba(254, 178, 178, 0.9);
      }

      .key-enter {
        min-width: 100px;
        background: rgba(198, 246, 213, 0.9);
        color: #276749;
      }

      .key-enter:hover {
        background: rgba(154, 230, 180, 0.9);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .keyboard-container {
          padding: 0.5rem;
        }

        .key {
          min-width: 35px;
          height: 45px;
          font-size: 0.8rem;
        }

        .key-space {
          min-width: 150px;
        }

        .key-backspace,
        .key-clear,
        .key-enter {
          min-width: 60px;
        }
      }

      @media (max-width: 480px) {
        .key {
          min-width: 30px;
          height: 40px;
          font-size: 0.7rem;
        }

        .key-space {
          min-width: 120px;
        }

        .key-backspace,
        .key-clear,
        .key-enter {
          min-width: 50px;
        }
      }
    `,
  ],
})
export class VirtualKeyboardComponent {
  @Input() visible = false;
  @Input() showEnter = false;
  @Output() keyPressed = new EventEmitter<string>();
  @Output() backspacePressed = new EventEmitter<void>();
  @Output() clearPressed = new EventEmitter<void>();
  @Output() enterPressed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  keyboardLayout = {
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    row1: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    row2: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    row3: ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  };

  typeKey(key: string) {
    this.keyPressed.emit(key);
  }

  backspace() {
    this.backspacePressed.emit();
  }

  clear() {
    this.clearPressed.emit();
  }

  enter() {
    this.enterPressed.emit();
  }

  close() {
    this.closed.emit();
  }

  onKeyboardClick(event: Event) {
    // Evitar que el clic se propague al overlay
    event.stopPropagation();
  }
}
