# API Endpoint: places/getInfoByIA

## Descripción
Este endpoint obtiene información generada por IA sobre un destino específico, incluyendo descripción, temperatura actual y puntos de interés.

## Endpoint
```
GET /api/places/getInfoByIA/{placeId}?lang={language}
```

## Parámetros

### Path Parameters
- `placeId` (string, requerido): ID del destino/ciudad

### Query Parameters
- `lang` (string, requerido): Código de idioma (ej: 'es', 'en')

## Respuesta

### Estructura de Respuesta Exitosa (HTTP 200)
```json
{
  "success": true,
  "data": {
    "description": "Lima es la capital del Perú, conocida como la Ciudad de los Reyes. Combina historia colonial con modernidad, siendo el centro político, cultural y económico del país.",
    "currentTemperature": "22°C",
    "pointsOfInterest": [
      "Centro Histórico",
      "Miraflores",
      "Barranco",
      "Plaza de Armas"
    ]
  }
}
```

### Estructura de Respuesta de Error (HTTP 400/500)
```json
{
  "success": false,
  "message": "Error al obtener información de IA para el destino"
}
```

## Campos de Respuesta

### PlaceInfoResponse
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `description` | string | Descripción detallada del destino generada por IA |
| `currentTemperature` | string | Temperatura actual del destino (ej: "22°C", "N/A") |
| `pointsOfInterest` | string[] | Array de puntos de interés principales del destino |

## Ejemplos de Uso

### Frontend (TypeScript)
```typescript
import { placesApi } from '../api/places';

// Obtener información de IA para Lima
const placeInfo = await placesApi.getInfoByIA('1', 'es');

console.log(placeInfo.description); // Descripción de Lima
console.log(placeInfo.currentTemperature); // "22°C"
console.log(placeInfo.pointsOfInterest); // ["Centro Histórico", "Miraflores", ...]
```

### cURL
```bash
curl -X GET "https://api.perutripsadventure.com/api/places/getInfoByIA/1?lang=es" \
  -H "Content-Type: application/json"
```

## Implementación Backend Sugerida

### Node.js/Express
```javascript
app.get('/api/places/getInfoByIA/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const { lang } = req.query;
    
    // Validar parámetros
    if (!placeId || !lang) {
      return res.status(400).json({
        success: false,
        message: 'placeId y lang son requeridos'
      });
    }
    
    // Obtener información del destino desde base de datos
    const destination = await Destination.findById(placeId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destino no encontrado'
      });
    }
    
    // Generar información con IA (ejemplo con OpenAI)
    const aiInfo = await generateDestinationInfo(destination, lang);
    
    res.json({
      success: true,
      data: {
        description: aiInfo.description,
        currentTemperature: aiInfo.temperature,
        pointsOfInterest: aiInfo.pointsOfInterest
      }
    });
    
  } catch (error) {
    console.error('Error en getInfoByIA:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});
```

### Función de IA (Ejemplo)
```javascript
async function generateDestinationInfo(destination, language) {
  const prompt = `
    Genera información turística para ${destination.cityName}, Perú:
    - Descripción atractiva y detallada (máximo 200 caracteres)
    - Temperatura actual estimada
    - 4 puntos de interés principales
    
    Idioma: ${language}
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });
  
  return parseAIResponse(response.choices[0].message.content);
}
```

## Consideraciones

1. **Rate Limiting**: Implementar límites de uso para evitar abuso
2. **Caching**: Cachear respuestas por 1-2 horas para mejorar performance
3. **Fallback**: Proporcionar información por defecto si la IA falla
4. **Validación**: Validar que el placeId existe en la base de datos
5. **Internacionalización**: Soporte para múltiples idiomas

## Estados de Error

| Código | Descripción |
|--------|-------------|
| 400 | Parámetros faltantes o inválidos |
| 404 | Destino no encontrado |
| 500 | Error interno del servidor o IA |
| 503 | Servicio de IA no disponible |
