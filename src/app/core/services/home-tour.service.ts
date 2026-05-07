import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

type Language = 'es' | 'en';

interface TourContent {
  step1: { title: string; description: string };
  step2: { title: string; description: string };
  step3: { title: string; description: string };
}

interface BrowserVoiceProfile {
  langCode: string;
  rate: number;
  pitch: number;
  preferredVoiceNames: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeTourService {
  private driverInstance: any;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioContext: AudioContext | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private currentGainNode: GainNode | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioUrl: string | null = null;
  private backendDisabledReason: string | null = null;
  private audioSessionId = 0;
  private isTourActive = false;
  private readonly BACKEND_URL = 'http://localhost:3001';
  private readonly BACKEND_AUDIO_GAIN = 1.8;
  private selectedLanguage: Language = 'es';
  private readonly browserVoiceProfiles: Record<Language, BrowserVoiceProfile> = {
    es: {
      langCode: 'es-MX',
      rate: 0.9,
      pitch: 0.92,
      preferredVoiceNames: [
        'Paulina',
        'Monica',
        'Jorge',
        'Sabina',
        'Dalia',
        'Helena',
        'Google espanol',
        'Google español',
        'Google español de Estados Unidos'
      ]
    },
    en: {
      langCode: 'en-US',
      rate: 0.88,
      pitch: 0.8,
      preferredVoiceNames: [
        'Samantha',
        'Alex',
        'Daniel',
        'Google US English',
        'Google UK English Male',
        'Google UK English Female',
        'Microsoft David',
        'Microsoft Guy',
        'Microsoft Aria'
      ]
    }
  };

  private translations: Record<Language, TourContent> = {
    es: {
      step1: {
        title: '🎯 Bienvenido',
        description: 'Bienvenido al Sistema de Gestión de Refacciones. El software fue creado para optimizar y automatizar la búsqueda y gestión de refacciones, herramientas y piezas de reposición en nuestro Tool Room. El objetivo es reducir tiempos de búsqueda, mantener un inventario organizado y mejorar la eficiencia operativa.'
      },
      step2: {
        title: '📍 Áreas de Trabajo',
        description: 'Para iniciar, seleccione el área donde quiere buscar su refacción. Tenemos 6 áreas disponibles: Corte, Costura, Consumibles, Herramientas, Químicos y Tornillos.'
      },
      step3: {
        title: '🔍 Búsqueda Global',
        description: 'También puede usar la Búsqueda Global para buscar mediante nombre, número de parte o número de SAP entre todo el catálogo del Tool Room.'
      }
    },
    en: {
      step1: {
        title: '🎯 Welcome',
        description: 'Welcome to the Parts Management System. This software was created to optimize and automate the search and management of spare parts, tools and replacement parts in our Tool Room. The objective is to reduce search times, maintain an organized inventory and improve operational efficiency.'
      },
      step2: {
        title: '📍 Work Areas',
        description: 'To start, select the area where you want to search for your spare parts. We have 6 available areas: Cutting, Sewing, Consumables, Tools, Chemicals and Fasteners.'
      },
      step3: {
        title: '🔍 Global Search',
        description: 'You can also use Global Search to search by name, part number or SAP number across our entire Tool Room catalog.'
      }
    }
  };

  constructor(private http: HttpClient) {}

  async startTourWithLanguageSelection(): Promise<void> {
    return new Promise((resolve) => {
      // Mostrar selector de idioma
      const languageModal = document.createElement('div');
      languageModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 60px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        max-width: 600px;
      `;

      const title = document.createElement('h2');
      title.textContent = 'Selecciona tu idioma / Select your language';
      title.style.cssText = 'margin: 0 0 40px 0; font-size: 28px; color: #1f2937; font-weight: 700;';
      modalContent.appendChild(title);

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'display: flex; gap: 15px; justify-content: center;';

      const esButton = document.createElement('button');
      esButton.textContent = '🇪🇸 Español';
      esButton.style.cssText = `
        padding: 16px 32px;
        font-size: 18px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.3s;
      `;
      esButton.onmouseover = () => esButton.style.background = '#2563eb';
      esButton.onmouseout = () => esButton.style.background = '#3b82f6';
      esButton.onclick = () => {
        this.selectedLanguage = 'es';
        document.body.removeChild(languageModal);
        this.startTour().then(resolve);
      };

      const enButton = document.createElement('button');
      enButton.textContent = '🇺🇸 English';
      enButton.style.cssText = `
        padding: 16px 32px;
        font-size: 18px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.3s;
      `;
      enButton.onmouseover = () => enButton.style.background = '#059669';
      enButton.onmouseout = () => enButton.style.background = '#10b981';
      enButton.onclick = () => {
        this.selectedLanguage = 'en';
        document.body.removeChild(languageModal);
        this.startTour().then(resolve);
      };

      buttonContainer.appendChild(esButton);
      buttonContainer.appendChild(enButton);
      modalContent.appendChild(buttonContainer);
      languageModal.appendChild(modalContent);
      document.body.appendChild(languageModal);
    });
  }

  async startTour(): Promise<void> {
    // Destruir tour anterior si existe
    if (this.driverInstance) {
      this.driverInstance.destroy();
    }

    this.stopCurrentAudio();
    this.isTourActive = true;

    const content = this.translations[this.selectedLanguage];

    // Agregar estilos CSS personalizados para driver.js
    const style = document.createElement('style');
    style.innerHTML = `
      .driver-popover {
        max-width: 700px !important;
        font-size: 18px !important;
      }
      .driver-popover-title {
        font-size: 32px !important;
        font-weight: bold !important;
      }
      .driver-popover-description {
        font-size: 20px !important;
        line-height: 1.6 !important;
      }
    `;
    document.head.appendChild(style);

    // Crear nueva instancia del tour
    this.driverInstance = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.4,
      onDestroyStarted: (_element, _step, { driver }) => {
        this.handleTourClose();
        driver.destroy();
      },
      steps: [
        {
          // Paso 1: Pantalla completa (sin elemento específico)
          popover: {
            title: content.step1.title,
            description: content.step1.description,
            side: 'top',
            align: 'center',
            onCloseClick: (_element, _step, { driver }) => {
              this.handleTourClose();
              driver.destroy();
            },
            onNextClick: (_element, _step, { driver }) => {
              this.handleStepNavigation();
              driver.moveNext();
            }
          },
          onHighlighted: async () => {
            await this.playAudio(content.step1.description);
          }
        },
        {
          // Paso 2: Enfasis en áreas (6 paneles)
          element: 'div.professional-grid.grid-3',
          popover: {
            title: content.step2.title,
            description: content.step2.description,
            side: 'bottom',
            align: 'center',
            onCloseClick: (_element, _step, { driver }) => {
              this.handleTourClose();
              driver.destroy();
            },
            onNextClick: (_element, _step, { driver }) => {
              this.handleStepNavigation();
              driver.moveNext();
            },
            onPrevClick: (_element, _step, { driver }) => {
              this.handleStepNavigation();
              driver.movePrevious();
            }
          },
          onHighlighted: async () => {
            await this.playAudio(content.step2.description);
          }
        },
        {
          // Paso 3: Enfasis en búsqueda global
          element: '.professional-grid.grid-2 .professional-card',
          popover: {
            title: content.step3.title,
            description: content.step3.description,
            side: 'bottom',
            align: 'center',
            onCloseClick: (_element, _step, { driver }) => {
              this.handleTourClose();
              driver.destroy();
            },
            onNextClick: (_element, _step, { driver }) => {
              this.handleTourClose();
              driver.moveNext();
            },
            onPrevClick: (_element, _step, { driver }) => {
              this.handleStepNavigation();
              driver.movePrevious();
            }
          },
          onHighlighted: async () => {
            await this.playAudio(content.step3.description);
          }
        }
      ]
    });

    // Iniciar el tour
    this.driverInstance.drive();
  }

  private async playAudio(text: string): Promise<void> {
    const sessionId = this.beginAudioSession();

    if (!this.isTourActive) {
      return;
    }

    if (this.shouldPreferBrowserSpeech()) {
      const spokenInBrowser = await this.playBrowserSpeech(text, sessionId);

      if (spokenInBrowser && this.isAudioSessionCurrent(sessionId)) {
        return;
      }

      if (this.isAudioSessionCurrent(sessionId)) {
        await this.tryBackendAudio(text, sessionId);
      }

      return;
    }

    const playedFromBackend = await this.tryBackendAudio(text, sessionId);

    if (playedFromBackend && this.isAudioSessionCurrent(sessionId)) {
      return;
    }

    if (this.isAudioSessionCurrent(sessionId)) {
      await this.playBrowserSpeech(text, sessionId);
    }
  }

  private shouldPreferBrowserSpeech(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const isElectronApp = !!(window as any).electron?.ipcRenderer;

    return !isElectronApp;
  }

  private async tryBackendAudio(text: string, sessionId: number): Promise<boolean> {
    if (this.backendDisabledReason) {
      return false;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return false;
    }

    try {
      const response = await this.http.post(
        `${this.BACKEND_URL}/api/text-to-speech`,
        { text, language: this.selectedLanguage },
        { responseType: 'blob' }
      ).toPromise();

      if (response) {
        if (!this.isAudioSessionCurrent(sessionId)) {
          return false;
        }

        await this.playBlobAudio(response, sessionId);
        return true;
      }
    } catch (error) {
      const status = (error as { status?: number }).status ?? 0;

      if (status === 401) {
        this.backendDisabledReason = 'invalid-api-key';
        console.warn('Audio backend deshabilitado: la API key de ElevenLabs es invalida.');
      } else if (status === 402) {
        this.backendDisabledReason = 'quota-exceeded';
        console.warn('Audio backend deshabilitado: la cuota de ElevenLabs fue excedida.');
      } else {
        console.warn('Audio backend no disponible:', error);
      }
      
    }

    return false;
  }

  private async playBlobAudio(audioBlob: Blob, sessionId: number): Promise<void> {
    try {
      await this.playAmplifiedBlobAudio(audioBlob, sessionId);
    } catch (error) {
      console.warn('No se pudo amplificar el audio; usando reproduccion normal.', error);
      await this.playHtmlAudio(audioBlob, sessionId);
    }
  }

  private async playAmplifiedBlobAudio(audioBlob: Blob, sessionId: number): Promise<void> {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      throw new Error('AudioContext no esta disponible.');
    }

    const audioContext = this.getAudioContext();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const audioBuffer = await audioBlob.arrayBuffer();
    const decodedBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));

    await new Promise<void>((resolve, reject) => {
      try {
        if (!this.isAudioSessionCurrent(sessionId)) {
          resolve();
          return;
        }

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();

        source.buffer = decodedBuffer;
        gainNode.gain.value = this.BACKEND_AUDIO_GAIN;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        this.currentAudioSource = source;
        this.currentGainNode = gainNode;

        source.onended = () => {
          this.cleanupAudioGraph();
          resolve();
        };

        source.start(0);
      } catch (error) {
        this.cleanupAudioGraph();
        reject(error);
      }
    });
  }

  private playHtmlAudio(audioBlob: Blob, sessionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isAudioSessionCurrent(sessionId)) {
        resolve();
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      this.currentAudioUrl = audioUrl;
      this.currentAudio.volume = 1;

      this.currentAudio.onended = () => {
        this.releaseCurrentAudioUrl(audioUrl);
        this.currentAudio = null;
        resolve();
      };

      this.currentAudio.onerror = (error) => {
        this.releaseCurrentAudioUrl(audioUrl);
        this.currentAudio = null;
        reject(error);
      };

      this.currentAudio.play().catch((error) => {
        this.releaseCurrentAudioUrl(audioUrl);
        this.currentAudio = null;
        reject(error);
      });
    });
  }

  private async playBrowserSpeech(text: string, sessionId: number): Promise<boolean> {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      console.warn('SpeechSynthesis no esta disponible en este navegador.');
      return false;
    }

    const chunks = this.chunkText(text);
    const voices = await this.waitForVoices();
    const voice = this.getMatchingVoice(voices);

    for (const chunk of chunks) {
      if (!this.isAudioSessionCurrent(sessionId)) {
        return false;
      }

      const chunkPlayed = await this.speakChunk(chunk, voice, sessionId);

      if (!chunkPlayed) {
        return false;
      }
    }

    return true;
  }

  private waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    const availableVoices = window.speechSynthesis.getVoices();

    if (availableVoices.length > 0) {
      return Promise.resolve(availableVoices);
    }

    return new Promise((resolve) => {
      const timeoutId = window.setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      }, 1000);

      const handleVoicesChanged = () => {
        window.clearTimeout(timeoutId);
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      };

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    });
  }

  private getMatchingVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    const profile = this.browserVoiceProfiles[this.selectedLanguage];
    const targetLang = profile.langCode.toLowerCase();
    const prefix = targetLang.split('-')[0];

    const candidates = voices
      .filter((voice) => voice.lang.toLowerCase().startsWith(prefix))
      .sort((left, right) => this.scoreVoice(right, profile, targetLang) - this.scoreVoice(left, profile, targetLang));

    return candidates[0] ?? null;
  }

  private scoreVoice(
    voice: SpeechSynthesisVoice,
    profile: BrowserVoiceProfile,
    targetLang: string
  ): number {
    const voiceName = this.normalizeVoiceName(voice.name);
    let score = 0;

    if (voice.lang.toLowerCase() === targetLang) {
      score += 50;
    }

    if (voice.localService) {
      score += 20;
    }

    const preferredIndex = profile.preferredVoiceNames.findIndex(
      (preferredName) => voiceName.includes(this.normalizeVoiceName(preferredName))
    );

    if (preferredIndex !== -1) {
      score += 100 - preferredIndex;
    }

    if (
      voiceName.includes('novelty') ||
      voiceName.includes('whisper') ||
      voiceName.includes('high') ||
      voiceName.includes('child')
    ) {
      score -= 40;
    }

    return score;
  }

  private normalizeVoiceName(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private chunkText(text: string, maxLength = 180): string[] {
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    if (!normalizedText) {
      return [];
    }

    const words = normalizedText.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
      const nextChunk = currentChunk ? `${currentChunk} ${word}` : word;

      if (nextChunk.length <= maxLength) {
        currentChunk = nextChunk;
        continue;
      }

      if (currentChunk) {
        chunks.push(currentChunk);
      }

      currentChunk = word;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private speakChunk(
    text: string,
    voice: SpeechSynthesisVoice | null,
    sessionId: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isAudioSessionCurrent(sessionId)) {
        resolve(false);
        return;
      }

      const profile = this.browserVoiceProfiles[this.selectedLanguage];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = profile.langCode;
      utterance.rate = profile.rate;
      utterance.pitch = profile.pitch;
      utterance.volume = 1;

      if (voice) {
        utterance.voice = voice;
      }

      this.currentUtterance = utterance;

      const resumeIntervalId = window.setInterval(() => {
        window.speechSynthesis.resume();
      }, 250);

      const finish = (success: boolean) => {
        window.clearInterval(resumeIntervalId);

        if (this.currentUtterance === utterance) {
          this.currentUtterance = null;
        }

        resolve(success && this.isAudioSessionCurrent(sessionId));
      };

      utterance.onend = () => finish(true);
      utterance.onerror = (event) => {
        console.warn('SpeechSynthesis fallo en un fragmento:', event.error);
        finish(false);
      };

      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.resume();
    });
  }

  private beginAudioSession(): number {
    this.stopCurrentAudio();
    this.audioSessionId += 1;
    return this.audioSessionId;
  }

  private isAudioSessionCurrent(sessionId: number): boolean {
    return this.isTourActive && this.audioSessionId === sessionId;
  }

  private handleStepNavigation(): void {
    this.beginAudioSession();
  }

  private handleTourClose(): void {
    this.isTourActive = false;
    this.beginAudioSession();
  }

  private getAudioContext(): AudioContext {
    if (!this.currentAudioContext) {
      this.currentAudioContext = new AudioContext();
    }

    return this.currentAudioContext;
  }

  private cleanupAudioGraph(): void {
    if (this.currentAudioSource) {
      this.currentAudioSource.disconnect();
      this.currentAudioSource = null;
    }

    if (this.currentGainNode) {
      this.currentGainNode.disconnect();
      this.currentGainNode = null;
    }
  }

  private releaseCurrentAudioUrl(audioUrl: string): void {
    URL.revokeObjectURL(audioUrl);

    if (this.currentAudioUrl === audioUrl) {
      this.currentAudioUrl = null;
    }
  }

  private stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }

    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
      } catch {
        // Ignorar si la fuente ya termino
      }
    }

    this.cleanupAudioGraph();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}
