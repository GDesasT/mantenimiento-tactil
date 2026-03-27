import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export type LanguageCode = 'es' | 'en' | 'fr' | 'pt';

export interface Language {
  name: string;
  voiceId: string;
  introduction: string;
  instructions: string;
  requestPrompt: string;
  placeholder: string;
  requestLabel: string;
  partPlaceholder: string;
  nextLabel: string;
  confirmLabel: string;
  successTitle: string;
  successMessage: string;
  completeLabel: string;
}

export interface VoiceDriverConfig {
  apiKey: string;
  voiceId: string;
  modelId: string;
  stability: number;
  similarityBoost: number;
}

@Injectable({
  providedIn: 'root',
})
export class VoiceDriverService {
  private readonly API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
  private readonly ELEVENLABS_API_KEY = '73dd87b0ebd67f53cf416a4a8c7ce7b492fd2b6934d7bbb3695323930f04e217';

  private selectedLanguage$ = new BehaviorSubject<LanguageCode>('es');
  private isPlaying$ = new BehaviorSubject<boolean>(false);

  readonly languages: Record<LanguageCode, Language> = {
    es: {
      name: 'Español',
      voiceId: 'dlGxemPxFMTY7iXagmOj',
      introduction:
        'Bienvenido al Sistema de Gestión de Refacciones. Este programa te ayuda a solicitar herramientas y refacciones de manera rápida y eficiente. Utilizamos reconocimiento de voz y síntesis de audio para hacer más accesible el proceso.',
      instructions:
        'Puedes solicitar cualquier refacción disponible en nuestro inventario. El sistema registrará tu solicitud con la fecha y hora, facilitando el seguimiento de tus pedidos.',
      requestPrompt: '¿Qué refacción necesitas?',
      placeholder: 'Ejemplo: Válvula de presión, Motor de arranque, Cilindro neumático',
      requestLabel: 'Solicita una refacción:',
      partPlaceholder: 'Ingresa el nombre de la refacción',
      nextLabel: 'Siguiente',
      confirmLabel: 'Confirmar',
      successTitle: 'Solicitud Registrada',
      successMessage: 'Tu solicitud ha sido registrada exitosamente en el sistema.',
      completeLabel: 'Solicitud completada',
    },
    en: {
      name: 'English',
      voiceId: 'dlGxemPxFMTY7iXagmOj',
      introduction:
        'Welcome to the Spare Parts Management System. This program helps you request tools and spare parts quickly and efficiently. We use voice recognition and audio synthesis to make the process more accessible.',
      instructions:
        'You can request any spare part available in our inventory. The system will record your request with the date and time, making it easier to track your orders.',
      requestPrompt: 'What spare part do you need?',
      placeholder: 'Example: Pressure valve, Starter motor, Pneumatic cylinder',
      requestLabel: 'Request a spare part:',
      partPlaceholder: 'Enter the name of the spare part',
      nextLabel: 'Next',
      confirmLabel: 'Confirm',
      successTitle: 'Request Registered',
      successMessage: 'Your request has been successfully registered in the system.',
      completeLabel: 'Request completed',
    },
    fr: {
      name: 'Français',
      voiceId: 'dlGxemPxFMTY7iXagmOj',
      introduction:
        'Bienvenue dans le Système de Gestion des Pièces de Rechange. Ce programme vous aide à demander des outils et des pièces de rechange rapidement et efficacement. Nous utilisons la reconnaissance vocale et la synthèse audio pour rendre le processus plus accessible.',
      instructions:
        'Vous pouvez demander n\'importe quelle pièce de rechange disponible dans notre inventaire. Le système enregistrera votre demande avec la date et l\'heure, facilitant le suivi de vos commandes.',
      requestPrompt: 'Quelle pièce de rechange avez-vous besoin?',
      placeholder: 'Exemple: Soupape de pression, Moteur de démarrage, Cylindre pneumatique',
      requestLabel: 'Demander une pièce de rechange:',
      partPlaceholder: 'Entrez le nom de la pièce de rechange',
      nextLabel: 'Suivant',
      confirmLabel: 'Confirmer',
      successTitle: 'Demande Enregistrée',
      successMessage: 'Votre demande a été enregistrée avec succès dans le système.',
      completeLabel: 'Demande complétée',
    },
    pt: {
      name: 'Português',
      voiceId: 'dlGxemPxFMTY7iXagmOj',
      introduction:
        'Bem-vindo ao Sistema de Gestão de Peças de Reposição. Este programa ajuda você a solicitar ferramentas e peças de reposição de forma rápida e eficiente. Usamos reconocimento de voz e síntese de áudio para tornar o processo mais acessível.',
      instructions:
        'Você pode solicitar qualquer peça de reposição disponível em nosso inventário. O sistema registrará sua solicitação com a data e hora, facilitando o rastreamento de seus pedidos.',
      requestPrompt: 'Qual peça de reposição você precisa?',
      placeholder: 'Exemplo: Válvula de pressão, Motor de arranque, Cilindro pneumático',
      requestLabel: 'Solicite uma peça de reposição:',
      partPlaceholder: 'Digite o nome da peça de reposição',
      nextLabel: 'Próximo',
      confirmLabel: 'Confirmar',
      successTitle: 'Solicitação Registrada',
      successMessage: 'Sua solicitação foi registrada com sucesso no sistema.',
      completeLabel: 'Solicitação concluída',
    },
  };

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el idioma actualmente seleccionado
   */
  getSelectedLanguage$(): Observable<LanguageCode> {
    return this.selectedLanguage$.asObservable();
  }

  /**
   * Establece el idioma seleccionado
   */
  setSelectedLanguage(languageCode: LanguageCode): void {
    this.selectedLanguage$.next(languageCode);
  }

  /**
   * Obtiene el estado de reproducción
   */
  getIsPlaying$(): Observable<boolean> {
    return this.isPlaying$.asObservable();
  }

  /**
   * Obtiene la configuración de idioma
   */
  getLanguageConfig(languageCode: LanguageCode): Language {
    return this.languages[languageCode];
  }

  /**
   * Sintetiza texto a voz usando ElevenLabs
   */
  async synthesizeAudio(text: string, languageCode: LanguageCode): Promise<Blob> {
    const voiceId = this.languages[languageCode].voiceId;

    try {
      this.isPlaying$.next(true);

      const response = await this.http
        .post(
          `${this.API_URL}/${voiceId}`,
          {
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          },
          {
            headers: {
              'xi-api-key': this.ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
            },
            responseType: 'blob',
          }
        )
        .toPromise();

      return response!;
    } catch (error: any) {
      console.error('Error al sintetizar audio:', error);
      throw error;
    } finally {
      this.isPlaying$.next(false);
    }
  }

  /**
   * Reproduce audio desde un Blob
   */
  playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);

        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };

        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Sintetiza y reproduce audio
   */
  async synthesizeAndPlay(text: string, languageCode: LanguageCode): Promise<void> {
    try {
      const audioBlob = await this.synthesizeAudio(text, languageCode);
      await this.playAudio(audioBlob);
    } catch (error) {
      console.error('Error en síntesis y reproducción:', error);
    }
  }
}
