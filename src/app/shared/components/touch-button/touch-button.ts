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
      <span *ngIf="icon && !loading" class="button-icon">{{ icon }}</span>

      <span class="button-text">
        <ng-content></ng-content>
      </span>

      <span *ngIf="loading" class="loading-indicator">
        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
            fill="none"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </span>
    </button>
  `,
  styles: [
    `
      button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        border: 1px solid transparent;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
        text-decoration: none;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        font-family: 'Inter', sans-serif;
        letter-spacing: 0.025em;
      }

      button:focus {
        outline: none;
        ring: 2px;
        ring-offset: 2px;
      }

      button:hover:not(:disabled) {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transform: translateY(-1px);
      }

      button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      }

      .button-icon {
        margin-right: 0.5rem;
        font-size: 1.1em;
        line-height: 1;
      }

      .button-text {
        font-weight: 600;
        line-height: 1.25;
      }

      .loading-indicator {
        margin-left: 0.5rem;
        display: flex;
        align-items: center;
      }

      .full-width {
        width: 100%;
      }

      /* Variantes profesionales */
      .btn-primary {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border-color: #1d4ed8;
      }

      .btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
        border-color: #1e3a8a;
      }

      .btn-primary:focus {
        ring-color: #3b82f6;
      }

      .btn-secondary {
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        color: #475569;
        border-color: #cbd5e1;
      }

      .btn-secondary:hover:not(:disabled) {
        background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
        border-color: #94a3b8;
        color: #334155;
      }

      .btn-secondary:focus {
        ring-color: #94a3b8;
      }

      .btn-success {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        color: white;
        border-color: #065f46;
      }

      .btn-success:hover:not(:disabled) {
        background: linear-gradient(135deg, #047857 0%, #065f46 100%);
        border-color: #064e3b;
      }

      .btn-success:focus {
        ring-color: #10b981;
      }

      .btn-warning {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        color: white;
        border-color: #92400e;
      }

      .btn-warning:hover:not(:disabled) {
        background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
        border-color: #78350f;
      }

      .btn-warning:focus {
        ring-color: #f59e0b;
      }

      .btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        border-color: #991b1b;
      }

      .btn-danger:hover:not(:disabled) {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        border-color: #7f1d1d;
      }

      .btn-danger:focus {
        ring-color: #ef4444;
      }

      /* Tamaños profesionales */
      .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        border-radius: 0.375rem;
        min-height: 2.5rem;
      }

      .btn-md {
        padding: 0.75rem 1.5rem;
        font-size: 0.875rem;
        border-radius: 0.5rem;
        min-height: 3rem;
      }

      .btn-lg {
        padding: 1rem 2rem;
        font-size: 1rem;
        border-radius: 0.5rem;
        min-height: 3.5rem;
      }

      .btn-xl {
        padding: 1.25rem 2.5rem;
        font-size: 1.125rem;
        border-radius: 0.75rem;
        min-height: 4rem;
      }

      /* Estados especiales */
      .btn-outline {
        background: transparent;
        border-width: 2px;
      }

      .btn-outline.btn-primary {
        color: #2563eb;
        border-color: #2563eb;
      }

      .btn-outline.btn-primary:hover:not(:disabled) {
        background: #2563eb;
        color: white;
      }

      .btn-ghost {
        background: transparent;
        border: none;
        box-shadow: none;
      }

      .btn-ghost:hover:not(:disabled) {
        background: rgba(0, 0, 0, 0.05);
        box-shadow: none;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .btn-lg,
        .btn-xl {
          padding: 0.875rem 1.5rem;
          font-size: 0.875rem;
          min-height: 3rem;
        }

        .button-icon {
          margin-right: 0.375rem;
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
  @Input() outline = false;
  @Input() ghost = false;
  @Input() icon = '';

  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const classes = [`btn-${this.variant}`, `btn-${this.size}`];

    if (this.fullWidth) {
      classes.push('full-width');
    }

    if (this.outline) {
      classes.push('btn-outline');
    }

    if (this.ghost) {
      classes.push('btn-ghost');
    }

    return classes.join(' ');
  }

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
