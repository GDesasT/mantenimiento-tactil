/**
 * Driver.js - Sistema de asistente de voz para pedir refacciones
 * Integración básica con ElevenLabs para TTS
 */

const axios = require('axios');
const readline = require('readline');
const speaker = require('speaker');
const { Readable } = require('stream');

// Configuración
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '73dd87b0ebd67f53cf416a4a8c7ce7b492fd2b6934d7bbb3695323930f04e217';
const ELEVENLABS_VOICE_ID = 'dlGxemPxFMTY7iXagmOj'; 
const API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Idiomas soportados
const LANGUAGES = {
  es: {
    name: 'Español',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    instruction: '¿Qué refacción necesitas? Por favor, dime el nombre de la pieza que requieres.',
    placeholder: 'Ejemplo: Válvula de presión, Motor de arranque, etc.',
  },
  en: {
    name: 'English',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    instruction: 'What part do you need? Please tell me the name of the part you require.',
    placeholder: 'Example: Pressure valve, Starter motor, etc.',
  },
  fr: {
    name: 'Français',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    instruction: 'De quelle pièce avez-vous besoin? Veuillez me dire le nom de la pièce que vous nécessitez.',
    placeholder: 'Exemple: Soupape de pression, Moteur de démarrage, etc.',
  },
  pt: {
    name: 'Português',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    instruction: 'Qual peça você precisa? Por favor, me diga o nome da peça que você necessita.',
    placeholder: 'Exemplo: Válvula de pressão, Motor de arranque, etc.',
  },
};

// Interface readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Sintetiza texto a voz usando ElevenLabs
 * @param {string} text - Texto a sintetizar
 * @param {string} voiceId - ID de la voz
 * @returns {Promise<Buffer>} Audio en formato MP3
 */
async function synthesizeAudio(text, voiceId) {
  try {
    console.log(`\n🔊 Sintetizando audio...\n`);

    const response = await axios.post(
      `${API_URL}/${voiceId}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('❌ Error: API key de ElevenLabs inválida o no configurada');
      console.error('   Por favor, configura la variable de entorno ELEVENLABS_API_KEY');
    } else if (error.response?.status === 402) {
      console.error('❌ Error: Cuota de ElevenLabs excedida');
    } else {
      console.error('❌ Error al sintetizar audio:', error.message);
    }
    throw error;
  }
}

/**
 * Reproduce audio
 * @param {Buffer} audioBuffer - Buffer de audio MP3
 */
function playAudio(audioBuffer) {
  return new Promise((resolve, reject) => {
    try {
      // Para desarrollo simple, simplemente notificamos que se reproduciría
      console.log('▶️  Audio listo para reproducir (simulado en desarrollo)\n');
      resolve();

      /* Descomentar para reproducción real (requiere mpg123 o similar):
      const cmd = require('child_process');
      const temp = require('tmp');
      const fs = require('fs');
      
      const tmpFile = temp.fileSync({ suffix: '.mp3' });
      fs.writeFileSync(tmpFile.name, audioBuffer);
      
      const playProcess = cmd.spawn('mpg123', [tmpFile.name]);
      playProcess.on('close', () => {
        fs.unlinkSync(tmpFile.name);
        resolve();
      });
      playProcess.on('error', reject);
      */
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Selecciona el idioma del driver
 * @returns {Promise<string>} Código del idioma seleccionado
 */
function selectLanguage() {
  return new Promise((resolve) => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  🌍 SISTEMA DE ASISTENTE DE VOZ - SELECCIÓN DE IDIOMA');
    console.log('═══════════════════════════════════════════════════════════\n');

    const languageOptions = Object.entries(LANGUAGES)
      .map(([code, lang], index) => `  ${index + 1}. ${lang.name} (${code})`)
      .join('\n');

    console.log('Idiomas disponibles:\n');
    console.log(languageOptions);
    console.log('\n');

    rl.question('Selecciona el número del idioma (1-4): ', (answer) => {
      const index = parseInt(answer) - 1;
      const languageCodes = Object.keys(LANGUAGES);

      if (index >= 0 && index < languageCodes.length) {
        resolve(languageCodes[index]);
      } else {
        console.log('❌ Opción inválida. Usando español por defecto.\n');
        resolve('es');
      }
    });
  });
}

/**
 * Solicita al usuario una refacción
 * @param {string} languageCode - Código del idioma
 * @returns {Promise<string>} Nombre de la refacción
 */
function requestPart(languageCode) {
  return new Promise((resolve) => {
    const lang = LANGUAGES[languageCode];
    const voiceId = lang.voiceId;

    console.log(`\n───────────────────────────────────────────────────────────`);
    console.log(`📋 Modo: ${lang.name}`);
    console.log(`───────────────────────────────────────────────────────────\n`);

    console.log(`📢 Instrucción de voz: "${lang.instruction}"\n`);
    console.log(`💡 ${lang.placeholder}\n`);

    rl.question('Refacción requerida: ', (part) => {
      if (!part.trim()) {
        console.log('❌ Por favor, ingresa un nombre de refacción válido.\n');
        resolve(requestPart(languageCode));
      } else {
        resolve(part.trim());
      }
    });
  });
}

/**
 * Confirma y registra la solicitud de refacción
 * @param {string} part - Nombre de la refacción
 * @param {string} languageCode - Código del idioma
 * @returns {Promise<boolean>} Si la solicitud fue confirmada
 */
function confirmRequest(part, languageCode) {
  return new Promise((resolve) => {
    const confirmMessages = {
      es: `¿Confirmar solicitud de "${part}"?`,
      en: `Confirm request for "${part}"?`,
      fr: `Confirmer la demande de "${part}"?`,
      pt: `Confirmar solicitação de "${part}"?`,
    };

    rl.question(`\n${confirmMessages[languageCode]} (s/n): `, (answer) => {
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Función principal del driver
 */
async function main() {
  try {
    console.clear();

    // 1. Seleccionar idioma
    const selectedLanguage = await selectLanguage();
    const lang = LANGUAGES[selectedLanguage];

    // 2. Sintetizar y reproducir instrucción
    try {
      const audioBuffer = await synthesizeAudio(lang.instruction, lang.voiceId);
      await playAudio(audioBuffer);
    } catch (error) {
      console.log('⚠️  No se pudo sintetizar el audio. Continuando...\n');
    }

    // 3. Solicitar refacción
    let confirmed = false;
    let partName = '';

    while (!confirmed) {
      partName = await requestPart(selectedLanguage);
      confirmed = await confirmRequest(partName, selectedLanguage);

      if (!confirmed) {
        console.log('\n↩️  Intenta de nuevo...');
      }
    }

    // 4. Registrar solicitud
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ SOLICITUD REGISTRADA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📦 Refacción: ${partName}`);
    console.log(`🌐 Idioma: ${lang.name}`);
    console.log(`⏰ Fecha: ${new Date().toLocaleString()}`);
    console.log('\n✨ La solicitud ha sido enviada al sistema.\n');

    rl.close();
  } catch (error) {
    console.error('❌ Error en el driver:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Iniciar el driver
main();
