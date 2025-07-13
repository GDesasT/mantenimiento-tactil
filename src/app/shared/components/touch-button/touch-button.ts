import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-touch-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      (click)="onClick()"
    >
      <span *ngIf="icon && !loading" class="mr-3 text-xl">{{ icon }}</span>

      <span class="font-bold tracking-wide">
        <ng-content></ng-content>
      </span>

      <span *ngIf="loading" class="ml-3 text-xl animate-spin">⚙️</span>
    </button>
  `,
  styles: [
    `
      button {
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        border: none;
        cursor: pointer;
        user-select: none;
        touch-action: manipulation;
      }

      button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        transition: left 0.5s;
      }

      button:hover::before {
        left: 100%;
      }

      button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
      }

      button:active {
        transform: translateY(0px) scale(0.98);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        transition: all 0.1s ease;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }

      button:disabled::before {
        display: none;
      }

      /* Gradientes modernos para cada variante */
      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .btn-primary:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }

      .btn-secondary {
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        color: #475569;
        border: 2px solid #cbd5e1;
      }

      .btn-secondary:hover {
        background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
        border-color: #94a3b8;
      }

      .btn-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .btn-success:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
      }

      .btn-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .btn-warning:hover {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      }

      .btn-danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .btn-danger:hover {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      }

      /* Tamaños más grandes y espaciados */
      .btn-sm {
        min-height: 56px;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        border-radius: 12px;
      }

      .btn-md {
        min-height: 68px;
        padding: 1rem 2rem;
        font-size: 1.125rem;
        border-radius: 16px;
      }

      .btn-lg {
        min-height: 80px;
        padding: 1.5rem 2.5rem;
        font-size: 1.25rem;
        border-radius: 20px;
      }

      .btn-xl {
        min-height: 96px;
        padding: 2rem 3rem;
        font-size: 1.5rem;
        border-radius: 24px;
      }

      .full-width {
        width: 100%;
      }

      /* Animación de carga mejorada */
      .animate-spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class TouchButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' =
    'primary';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() fullWidth = false;
  @Input() icon = '';

  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const classes = [
      'flex items-center justify-center font-bold transition-all duration-300',
      `btn-${this.variant}`,
      `btn-${this.size}`,
    ];

    if (this.fullWidth) {
      classes.push('full-width');
    }

    return classes.join(' ');
  }

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
