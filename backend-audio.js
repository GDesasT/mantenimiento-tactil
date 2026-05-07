const axios = require('axios');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

loadEnvFile();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Configuración ElevenLabs
const DEFAULT_ELEVENLABS_API_KEY = '73dd87b0ebd67f53cf416a4a8c7ce7b492fd2b6934d7bbb3695323930f04e217';
const DEFAULT_ELEVENLABS_VOICE_ID_ES = 'qSeXEcewz7tA0Q0qk9fH';
const DEFAULT_ELEVENLABS_VOICE_ID_EN = 'qSeXEcewz7tA0Q0qk9fH';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY?.trim() || DEFAULT_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_IDS = {
  es:
    process.env.ELEVENLABS_VOICE_ID_ES?.trim() ||
    process.env.ELEVENLABS_VOICE_ID?.trim() ||
    DEFAULT_ELEVENLABS_VOICE_ID_ES,
  en:
    process.env.ELEVENLABS_VOICE_ID_EN?.trim() ||
    process.env.ELEVENLABS_VOICE_ID?.trim() ||
    DEFAULT_ELEVENLABS_VOICE_ID_EN
};
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const PORT = Number.parseInt(process.env.AUDIO_BACKEND_PORT || '3001', 10);

if (!process.env.ELEVENLABS_API_KEY) {
  console.warn('⚠️  ELEVENLABS_API_KEY no viene desde variables de entorno; usando el valor embebido actual.');
}

/**
 * Endpoint para convertir texto a voz
 */
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const requestedLanguage = req.body?.language === 'en' ? 'en' : 'es';
    const voiceId = ELEVENLABS_VOICE_IDS[requestedLanguage];

    if (!text) {
      return res.status(400).json({ error: 'El texto es requerido' });
    }

    if (text.length > 5000) {
      return res.status(413).json({ error: 'El texto es demasiado largo' });
    }

    console.log(`🎤 Sintetizando: "${text}"`);

    // Llamar a ElevenLabs
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/${voiceId}`,
      {
        text,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.42,
          similarity_boost: 0.82
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 20000
      }
    );

    // Retornar el audio como blob
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.send(response.data);

    console.log('✅ Audio generado exitosamente');
  } catch (error) {
    const statusCode = error.response?.status;
    const providerMessage =
      error.response?.data?.detail?.message ||
      error.response?.data?.message ||
      error.message;

    console.error(`❌ Error con ElevenLabs (${statusCode || 'sin status'}):`, providerMessage);

    if (statusCode === 401) {
      res.status(401).json({ error: 'API key inválida' });
    } else if (statusCode === 402) {
      res.status(402).json({ error: 'Cuota de ElevenLabs excedida' });
    } else if (statusCode === 413) {
      res.status(413).json({ error: 'Texto demasiado largo para sintetizar' });
    } else {
      res.status(500).json({ error: 'Error al procesar audio' });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    voiceIds: ELEVENLABS_VOICE_IDS,
    modelId: ELEVENLABS_MODEL_ID
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Backend de audio escuchando en http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST http://localhost:${PORT}/api/text-to-speech\n`);
});

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  for (const rawLine of envContent.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}
