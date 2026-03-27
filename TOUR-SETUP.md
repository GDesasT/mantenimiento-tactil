# 🎤 Sistema de Tour Interactivo con Voz

## Configuración del Tour con ElevenLabs

El sistema incluye un tour interactivo que guía a los usuarios a través de la aplicación con narración de voz usando ElevenLabs.

### ¿Cómo funciona?

1. **Frontend (Angular)**: Interfaz interactiva con `driver.js`
2. **Backend (Node.js)**: Proxy para ElevenLabs (evita problemas de CORS)
3. **ElevenLabs**: Servicio de síntesis de texto a voz

### Ejecución en Desarrollo

Para ejecutar ambos servidores simultáneamente:

```bash
npm run dev
```

Esto iniciará:
- ✅ Frontend Angular: `http://localhost:4200`
- ✅ Backend de Audio: `http://localhost:3001`

### Ejecución Manual (si lo prefieres)

**Terminal 1 - Frontend:**
```bash
npm start
```

**Terminal 2 - Backend de Audio:**
```bash
npm run audio-backend
```

### Usando el Tour

1. Navega a la página de inicio (Home)
2. Haz clic en el botón **"?"** en la navbar (arriba a la derecha)
3. El tour se iniciará con:
   - **Paso 1**: Explicación de Áreas de Trabajo (con voz)
   - **Paso 2**: Explicación de Búsqueda Global (con voz)

### Archivos Importantes

- **Frontend**: `/src/app/core/services/home-tour.service.ts`
- **Backend**: `/backend-audio.js`
- **Componente**: `/src/app/features/home/home.ts`

### Configuración de ElevenLabs

La API Key y Voice ID ya están configurados en `backend-audio.js`:
- API Key: `73dd87b0ebd67f53cf416a4a8c7ce7b492fd2b6934d7bbb3695323930f04e217`
- Voice ID: `dlGxemPxFMTY7iXagmOj`
- Modelo: `eleven_multilingual_v2`

### En Electron (Producción)

Cuando generes el build para Electron, el backend puede:
1. Ejecutarse como proceso hijo en Electron
2. Reemplazarse con una llamada directa a ElevenLabs si implementas un proxy seguro

Para configurar en Electron, actualiza `main.js` para iniciar el backend junto con la aplicación.

### Solución de Problemas

**Error: "ECONNREFUSED" en el navegador**
- Asegúrate de que el backend está ejecutándose: `npm run audio-backend`

**Sin audio pero tour visible**
- El tour funcionará sin audio si el backend no está disponible

**Error de API Key**
- Verifica que el backend-audio.js tenga la API key correcta

---

**Creado**: 14 de enero de 2026
**Desarrollador**: DTSoftware
