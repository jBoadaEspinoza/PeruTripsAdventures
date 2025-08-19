# Configuración Simple

Este sistema usa un archivo de configuración centralizado para gestionar toda la información del negocio.

## Archivo de Configuración

El archivo principal está en `src/config/appConfig.ts`:

```typescript
export const appConfig: AppConfig = {
  business: {
    ruc: "104303915",           // RUC del negocio
    name: "Peru Trips Adventures", // Nombre del negocio
    website: "perutripsadventures.com", // Sitio web
    phone: "+51 1 234 5678",    // Teléfono
    address: "Lima, Perú",       // Dirección
    email: "info@perutripsadventures.com" // Email
  },
  colors: {
    primary: "#DC143C",         // Color primario
    secondary: "#2C3E50",       // Color secundario
    accent: "#FFC107"           // Color de acento
  },
  api: {
    baseUrl: "https://tg4jd2gc-8080.brs.devtunnels.ms", // URL de la API
    timeout: 10000              // Timeout de las peticiones
  }
};
```

## Cómo Usar

### 1. Cambiar el RUC
Para cambiar el RUC del negocio, simplemente edita el archivo `src/config/appConfig.ts`:

```typescript
business: {
  ruc: "TU_NUEVO_RUC", // Cambia este valor
  // ... resto de la configuración
}
```

### 2. Cambiar Colores
Para cambiar los colores de la aplicación:

```typescript
colors: {
  primary: "#007bff",    // Color primario (azul)
  secondary: "#6c757d",  // Color secundario (gris)
  accent: "#ffc107"      // Color de acento (amarillo)
}
```

### 3. Cambiar Información del Negocio
Para cambiar la información del negocio:

```typescript
business: {
  ruc: "20123456789",
  name: "Tu Nombre de Negocio",
  website: "tudominio.com",
  phone: "+51 1 234 5678",
  address: "Tu Dirección",
  email: "tu@email.com"
}
```

## Uso Automático

El sistema automáticamente:

1. **Carga el RUC** en todas las llamadas a la API
2. **Aplica los colores** a toda la aplicación
3. **Muestra la información del negocio** en el footer
4. **Establece el título de la página** con el nombre del negocio

## API Calls

Todas las llamadas a la API automáticamente incluyen el RUC como `companyId`:

- `GET /api/v1/activities/search?companyId=104303915`
- `GET /api/v1/activities/search/{id}?companyId=104303915`
- `GET /api/v1/activities/destinations?companyId=104303915`

## Reinicio Necesario

Después de cambiar el archivo de configuración:

1. **Guarda el archivo** `src/config/appConfig.ts`
2. **Reinicia el servidor de desarrollo**: `Ctrl+C` → `npm run dev`
3. **Recarga la página** del navegador

Los cambios se aplicarán automáticamente después del reinicio. 