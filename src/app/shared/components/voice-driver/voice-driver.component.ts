import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { VoiceDriverService, LanguageCode } from '../../../core/services/voice-driver.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

type DriverStep = 'intro' | 'request' | 'confirm' | 'complete';

@Component({
  selector: 'app-voice-driver',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
  ],
  template: `
    <div class="driver-container" *ngIf="isOpen">
      <div class="driver-modal">
        <!-- Step: Intro -->
        <div class="step" *ngIf="currentStep === 'intro'">
          <div class="header">
            <h2>🎙️ {{ currentLanguageConfig.name }}</h2>
            <button (click)="closeDriver()" class="close-btn">✕</button>
          </div>
          <div class="content">
            <div class="introduction">
              <h3>{{ currentLanguageConfig.introduction }}</h3>
            </div>
            <div class="instructions">
              {{ currentLanguageConfig.instructions }}
            </div>
            <div class="audio-control">
              <button (click)="playIntroduction()" class="play-btn" [disabled]="isPlaying">
                {{ isPlaying ? '⏳ Reproduciendo...' : '🔊 Escuchar' }}
              </button>
            </div>
          </div>
          <div class="actions">
            <button (click)="closeDriver()">Cerrar</button>
            <button (click)="nextStep()" color="primary">Siguiente</button>
          </div>
        </div>

        <!-- Step: Request -->
        <div class="step" *ngIf="currentStep === 'request'">
          <div class="header">
            <h2>🎙️ {{ currentLanguageConfig.name }}</h2>
            <button (click)="closeDriver()" class="close-btn">✕</button>
          </div>
          <div class="content">
            <label>{{ currentLanguageConfig.requestLabel }}</label>
            <input 
              type="text" 
              class="part-input"
              [(ngModel)]="partName"
              (keyup.enter)="confirmRequest()"
              [placeholder]="currentLanguageConfig.partPlaceholder"
            />
          </div>
          <div class="actions">
            <button (click)="previousStep()" class="back-btn">Atrás</button>
            <button (click)="confirmRequest()" color="primary" [disabled]="!partName.trim()">
              {{ currentLanguageConfig.nextLabel }}
            </button>
          </div>
        </div>

        <!-- Step: Confirm -->
        <div class="step" *ngIf="currentStep === 'confirm'">
          <div class="header">
            <h2>🎙️ {{ currentLanguageConfig.name }}</h2>
            <button (click)="closeDriver()" class="close-btn">✕</button>
          </div>
          <div class="content">
            <div class="confirmation-card">
              <div class="confirm-detail">
                <label>Componente Solicitado:</label>
                <p class="value">{{ partName }}</p>
              </div>
              <div class="confirm-detail">
                <label>Idioma:</label>
                <p class="value">{{ currentLanguageConfig.name }}</p>
              </div>
            </div>
          </div>
          <div class="actions">
            <button (click)="previousStep()" class="back-btn">Atrás</button>
            <button (click)="submitRequest()" class="submit-btn" color="primary">
              {{ currentLanguageConfig.confirmLabel }}
            </button>
          </div>
        </div>

        <!-- Step: Complete -->
        <div class="step complete-step" *ngIf="currentStep === 'complete'">
          <div class="header">
            <h2>🎙️ {{ currentLanguageConfig.name }}</h2>
            <button (click)="closeDriver()" class="close-btn">✕</button>
          </div>
          <div class="content">
            <div class="success">
              <div class="success-icon">✅</div>
              <h2>{{ currentLanguageConfig.successTitle }}</h2>
              <p class="success-message">{{ currentLanguageConfig.successMessage }}</p>
              <div class="success-card">
                <div class="success-detail">{{ partName }}</div>
                <div class="success-time">{{ currentLanguageConfig.completeLabel }}</div>
              </div>
            </div>
          </div>
          <div class="actions">
            <button (click)="closeDriver()" class="finish-btn" color="primary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .driver-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .driver-modal {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 500px;
        padding: 2rem;
        max-height: 80vh;
        overflow-y: auto;
      }

      .step {
        display: flex;
        flex-direction: column;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .header h2 {
        margin: 0;
        font-size: 1.3rem;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
      }

      .content {
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }

      .content p {
        margin: 0.5rem 0;
        color: #666;
      }

      .actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }

      button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .back-btn {
        background: #f5f5f5;
        color: #333;
      }

      .back-btn:hover:not(:disabled) {
        background: #e0e0e0;
      }

      .submit-btn,
      button[color="primary"] {
        background: #2196f3;
        color: white;
      }

      button[color="primary"]:hover:not(:disabled) {
        background: #1976d2;
      }

      .close-btn:hover {
        color: #333;
      }

      .success-icon {
        font-size: 3rem;
        text-align: center;
        margin-bottom: 1rem;
      }

      .success-message {
        text-align: center;
        color: #666;
        margin-bottom: 1rem;
      }

      @media (max-width: 600px) {
        .driver-modal {
          width: 95%;
          padding: 1.5rem;
        }

        .header h2 {
          font-size: 1.1rem;
        }
      }
    `,
  ],
})
export class VoiceDriverComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentStep: DriverStep = 'intro';
  currentLanguage: LanguageCode = 'es';
  partName = '';
  isPlaying = false;

  private destroy$ = new Subject<void>();

  constructor(
    private voiceDriver: VoiceDriverService,
    private dialog: MatDialog
  ) {
    console.log('🎙️ VoiceDriverComponent Constructor - Inicializando...');
  }

  ngOnInit(): void {
    console.log('🎙️ VoiceDriverComponent ngOnInit - Ciclo de vida iniciado');
    this.voiceDriver
      .getIsPlaying$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isPlaying: boolean) => {
        this.isPlaying = isPlaying;
        console.log('🎙️ VoiceDriver isPlaying changed:', isPlaying);
      });
    console.log('✅ VoiceDriverComponent ngOnInit - Completado');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentLanguageConfig() {
    return this.voiceDriver.getLanguageConfig(this.currentLanguage);
  }

  openDriver(): void {
    this.isOpen = true;
    this.currentStep = 'intro';
    this.partName = '';
    this.selectLanguage();
  }

  closeDriver(): void {
    this.isOpen = false;
    this.currentStep = 'intro';
    this.partName = '';
  }

  selectLanguage(): void {
    const dialogRef = this.dialog.open(LanguageSelectorComponent, {
      width: '400px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.currentLanguage = result;
      } else {
        this.closeDriver();
      }
    });
  }

  playIntroduction(): void {
    const text = this.currentLanguageConfig.introduction;
    this.voiceDriver.synthesizeAndPlay(text, this.currentLanguage);
  }

  nextStep(): void {
    if (this.currentStep === 'intro') {
      this.currentStep = 'request';
    }
  }

  previousStep(): void {
    if (this.currentStep === 'confirm') {
      this.currentStep = 'request';
    }
  }

  confirmRequest(): void {
    if (this.partName.trim()) {
      this.currentStep = 'confirm';
    }
  }

  submitRequest(): void {
    console.log('Solicitud:', { part: this.partName, language: this.currentLanguage });
    this.currentStep = 'complete';
  }

  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
