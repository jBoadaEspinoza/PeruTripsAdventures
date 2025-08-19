# Configuración de Google Maps

## Requisitos Previos

Para usar la funcionalidad de Google Maps en la aplicación, necesitas:

1. **Cuenta de Google Cloud Platform**
2. **Proyecto habilitado con Google Maps API**
3. **API Key válida**

## Pasos de Configuración

### 1. Crear Proyecto en Google Cloud Platform

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

### 2. Generar API Key

1. En la consola de Google Cloud, ve a **APIs & Services > Credentials**
2. Haz clic en **+ CREATE CREDENTIALS > API key**
3. Copia la API key generada

### 3. Configurar la Aplicación

#### Opción A: Variable de Entorno (Recomendado)

1. Crea un archivo `.env` en la raíz del proyecto
2. Agrega la siguiente línea:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```

#### Opción B: Configuración Directa

1. Abre `src/config/googleMaps.ts`
2. Reemplaza `'YOUR_GOOGLE_MAPS_API_KEY'` con tu API key real

### 4. Restricciones de Seguridad (Opcional pero Recomendado)

1. En Google Cloud Console, ve a **APIs & Services > Credentials**
2. Haz clic en tu API key
3. En **Application restrictions**, selecciona **HTTP referrers (web sites)**
4. Agrega los dominios donde se usará la aplicación:
   - `localhost:3000/*` (desarrollo)
   - `tu-dominio.com/*` (producción)

## Funcionalidades Implementadas

### Modal de Google Maps

- **Búsqueda de ubicaciones** cercanas a la ciudad de origen
- **Selección por clic** en el mapa
- **Geocodificación inversa** para obtener direcciones
- **Restricción geográfica** según la ciudad seleccionada
- **Marcadores personalizados** para ciudad de origen y ubicaciones seleccionadas

### Integración con el Formulario

- **Botón "Añadir dirección"** abre el modal de Google Maps
- **Búsqueda filtrada** por ciudad de origen
- **Guardado de coordenadas** y direcciones
- **Validación** de ubicaciones duplicadas

## Estructura de Archivos

```
src/
├── components/
│   └── GoogleMapsModal.tsx          # Modal principal de Google Maps
├── config/
│   └── googleMaps.ts                # Configuración y API key
├── types/
│   └── index.ts                     # Tipos de TypeScript para Google Maps
└── pages/extranet/create_activity/
    └── StepOptionMeetingPickup.tsx  # Formulario que usa Google Maps
```

## Uso

1. **Selecciona ciudad de origen** en el formulario
2. **Haz clic en "Añadir dirección"** o "Añadir área"
3. **Busca ubicación** en el modal de Google Maps
4. **Selecciona ubicación** por búsqueda o clic en el mapa
5. **Guarda la ubicación** en el formulario

## Notas Importantes

- **API Key**: Nunca expongas tu API key en código público
- **Límites**: Google Maps tiene límites de uso gratuitos
- **Costo**: El uso excesivo puede generar costos
- **Pruebas**: Prueba en localhost antes de desplegar

## Solución de Problemas

### Error: "Google Maps JavaScript API error: ApiNotActivatedMapError"

- Verifica que la API esté habilitada en Google Cloud Console
- Confirma que la API key sea válida

### Error: "Google Maps JavaScript API error: QuotaExceededError"

- Has excedido el límite gratuito de Google Maps
- Considera actualizar tu plan de facturación

### El mapa no se carga

- Verifica que la API key esté configurada correctamente
- Confirma que las APIs estén habilitadas
- Revisa la consola del navegador para errores

## Soporte

Para problemas con Google Maps API:
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Support](https://cloud.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-maps-api-3) 