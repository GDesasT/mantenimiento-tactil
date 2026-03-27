import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { VoiceDriverService, LanguageCode } from '../../../core/services/voice-driver.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatRadioModule, FormsModule],
  template: `
    <div class="language-selector">
      <h2 class="title">🌍 Selecciona tu idioma / Select your language</h2>

      <div class="language-options">
        <div class="option-group" *ngFor="let lang of languages">
          <mat-radio-button [value]="lang.code" [(ngModel)]="selectedLanguage">
            <span class="flag">{{ lang.flag }}</span>
            <span class="name">{{ lang.name }}</span>
          </mat-radio-button>
        </div>
      </div>

      <div class="actions">
        <button mat-raised-button (click)="onCancel()" class="cancel-btn">
          Cancelar / Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onConfirm()" class="confirm-btn">
          Continuar / Continue
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .language-selector {
        padding: 2rem;
        text-align: center;
      }

      .title {
        font-size: 1.5rem;
        margin-bottom: 2rem;
        color: #333;
      }

      .language-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .option-group {
        display: flex;
        align-items: center;
      }

      ::ng-deep .mat-mdc-radio-button {
        margin-right: 1rem;
      }

      .flag {
        font-size: 1.5rem;
        margin-right: 0.5rem;
      }

      .name {
        font-size: 1rem;
        font-weight: 500;
      }

      .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .cancel-btn,
      .confirm-btn {
        min-width: 120px;
      }
    `,
  ],
})
export class LanguageSelectorComponent {
  selectedLanguage: LanguageCode = 'es';

  languages = [
    { code: 'es' as LanguageCode, name: 'Español', flag: '🇪🇸' },
    { code: 'en' as LanguageCode, name: 'English', flag: '🇬🇧' },
    { code: 'fr' as LanguageCode, name: 'Français', flag: '🇫🇷' },
    { code: 'pt' as LanguageCode, name: 'Português', flag: '🇵🇹' },
  ];

  constructor(
    public dialogRef: MatDialogRef<LanguageSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private voiceDriver: VoiceDriverService
  ) {}

  onConfirm(): void {
    this.voiceDriver.setSelectedLanguage(this.selectedLanguage);
    this.dialogRef.close(this.selectedLanguage);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
