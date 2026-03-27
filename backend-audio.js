const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración ElevenLabs
const ELEVENLABS_API_KEY = '73dd87b0ebd67f53cf416a4a8c7ce7b492fd2b6934d7bbb3695323930f04e217';
const ELEVENLABS_VOICE_ID = 'dlGxemPxFMTY7iXagmOj';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

/**
 * Endpoint para convertir texto a voz
 */
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'El texto es requerido' });
    }

    console.log(`🎤 Sintetizando: "${text}"`);

    // Llamar a ElevenLabs
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/${ELEVENLABS_VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Retornar el audio como blob
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);

    console.log('✅ Audio generado exitosamente');
  } catch (error) {
    console.error('❌ Error con ElevenLabs:', error.message);

    if (error.response?.status === 401) {
      res.status(401).json({ error: 'API key inválida' });
    } else if (error.response?.status === 402) {
      res.status(402).json({ error: 'Cuota de ElevenLabs excedida' });
    } else {
      res.status(500).json({ error: 'Error al procesar audio' });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend de audio escuchando en http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST http://localhost:${PORT}/api/text-to-speech\n`);
});
