import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-virtual-keyboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="virtual-keyboard"
      *ngIf="visible"
      (click)="onKeyboardClick($event)"
    >
      <div class="keyboard-container" role="dialog" aria-label="Teclado virtual">
        <div class="keyboard-header">
          <button
            type="button"
            class="close-keyboard-btn"
            (click)="close()"
            aria-label="Cerrar teclado"
          >
            ✕
          </button>
        </div>

        <div class="keyboard-grid">
          <!-- Fila de números -->
          <div class="keyboard-row">
            <button
              *ngFor="let key of keyboardLayout.numbers; trackBy: trackByIndex"
              class="key"
              type="button"
              (click)="typeKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Primera fila de letras -->
          <div class="keyboard-row">
            <button
              *ngFor="let key of keyboardLayout.row1; trackBy: trackByIndex"
              class="key"
              type="button"
              (click)="typeKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Segunda fila de letras -->
          <div class="keyboard-row">
            <button
              *ngFor="let key of keyboardLayout.row2; trackBy: trackByIndex"
              class="key"
              type="button"
              (click)="typeKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Tercera fila de letras -->
          <div class="keyboard-row">
            <button
              *ngFor="let key of keyboardLayout.row3; trackBy: trackByIndex"
              class="key"
              type="button"
              (click)="typeKey(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Fila de acciones -->
          <div class="keyboard-row keyboard-actions-row">
            <button class="key key-space" type="button" (click)="typeKey(' ')">
              Espacio
            </button>
            <button
              class="key key-enter"
              type="button"
              (click)="enter()"
              *ngIf="showEnter"
            >
              ↵ Enter
            </button>
            <button class="key key-backspace" type="button" (click)="backspace()">
              ⌫
            </button>
            <button class="key key-clear" type="button" (click)="clear()">
              Limpiar
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
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 0.75rem;
        padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
        background: transparent;
        border: none;
        z-index: 1000;
        pointer-events: none;
      }

      .keyboard-container {
        width: min(980px, calc(100vw - 1rem));
        max-height: min(72vh, 560px);
        overflow-y: auto;
        margin: 0;
        padding: 0.9rem;
        border-radius: 1rem;
        background: rgba(248, 250, 252, 0.08);
        pointer-events: auto;
      }

      .keyboard-header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .close-keyboard-btn {
        width: 56px;
        height: 56px;
        border: 1px solid rgba(203, 213, 225, 0.8);
        border-radius: 0.75rem;
        background: rgba(241, 245, 249, 0.95);
        color: #64748b;
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
      }

      .close-keyboard-btn:hover {
        background: rgba(226, 232, 240, 0.95);
        transform: translateY(-1px);
      }

      .keyboard-grid {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }

      .keyboard-row {
        display: flex;
        justify-content: center;
        gap: clamp(0.25rem, 0.8vw, 0.5rem);
        width: 100%;
      }

      .key {
        flex: 1 1 0;
        min-width: 0;
        max-width: 72px;
        height: 56px;
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
        font-size: clamp(0.95rem, 1.8vw, 1.05rem);
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
        flex: 2.2 1 0;
        max-width: none;
      }

      .key-enter,
      .key-backspace,
      .key-clear {
        flex: 1 1 0;
        max-width: 130px;
      }

      .key-backspace,
      .key-clear {
        background: rgba(254, 215, 215, 0.9);
        color: #c53030;
      }

      .key-backspace:hover,
      .key-clear:hover {
        background: rgba(254, 178, 178, 0.9);
      }

      .key-enter {
        background: rgba(198, 246, 213, 0.9);
        color: #276749;
      }

      .key-enter:hover {
        background: rgba(154, 230, 180, 0.9);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .virtual-keyboard {
          padding: 0.5rem;
          padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
        }

        .keyboard-container {
          width: calc(100vw - 0.5rem);
          max-height: 68vh;
          padding: 0.75rem;
        }

        .key {
          height: 48px;
          max-width: none;
          font-size: 0.9rem;
          border-radius: 0.6rem;
        }

        .key-space {
          flex: 1.8 1 0;
        }

        .key-enter,
        .key-backspace,
        .key-clear {
          max-width: none;
        }

        .close-keyboard-btn {
          width: 46px;
          height: 46px;
          font-size: 1.2rem;
        }
      }

      @media (max-width: 480px) {
        .keyboard-container {
          max-height: 64vh;
        }

        .key {
          height: 44px;
          font-size: 0.82rem;
        }

        .key-space {
          flex: 1.6 1 0;
        }

        .key-enter,
        .key-backspace,
        .key-clear {
          flex: 0.95 1 0;
        }
      }
    `,
  ],
})
export class VirtualKeyboardComponent {
  @Input() visible = false;
  @Input() showEnter = true;
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

  trackByIndex(index: number) {
    return index;
  }

  onKeyboardClick(event: Event) {
    // Evitar que el clic se propague al overlay
    event.stopPropagation();
  }
}
