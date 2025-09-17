import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra el manejo de saltos de línea en todos los elementos
const ItineraryScheduleLineBreaksAllExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Manejo de Saltos de Línea en Todos los Elementos",
    start: {
      id: 'start',
      type: 'start',
      title: 'Punto de Partida\nMultilínea',
      description: 'Lugar de inicio del tour\ncon múltiples líneas\nde descripción',
      icon: 'fas fa-play',
      color: 'bg-success text-white'
    },
    end: {
      id: 'end',
      type: 'end',
      title: 'Punto Final\nMultilínea',
      description: 'Lugar de finalización\ndel tour con\ndescripción extendida',
      icon: 'fas fa-flag-checkered',
      color: 'bg-danger text-white'
    },
    items: [
      {
        id: '1',
        type: 'activity',
        title: 'Actividad con\nTítulo Multilínea',
        subtitle: 'Subtítulo con\nmúltiples líneas\nde descripción\ndetallada',
        duration: '2h30min',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '2',
        type: 'route',
        title: 'Transfer con\nTítulo Largo',
        subtitle: 'Viaje con descripción\nmultilínea que incluye\ndetalles del recorrido\ny puntos de interés',
        duration: '3h',
        icon: 'fas fa-route',
        color: 'bg-info text-white',
        subItems: [
          {
            id: '2-1',
            type: 'sub-activity',
            title: 'Parada 1\nMultilínea',
            subtitle: 'Descanso y estiramiento\nen área designada\ncon servicios básicos',
            duration: '20min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-2',
            type: 'sub-activity',
            title: 'Parada 2',
            subtitle: 'Almuerzo en restaurante\ntradicional con vista\nal mar y especialidades\nlocales de la región',
            duration: '1h30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-3',
            type: 'sub-activity',
            title: 'Parada 3\nPanorámica',
            subtitle: 'Visita al mirador\npanorámico para fotos\ny descanso con vista\nprivilegiada del paisaje',
            duration: '45min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '3',
        type: 'activity',
        title: 'Actividad Principal\ncon Título Extendido',
        subtitle: 'Actividad principal\ndel día con descripción\ndetallada de las actividades\na realizar durante la visita',
        duration: '4h',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Visita Guiada\nCompleta',
            subtitle: 'Recorrido por las salas\nprincipales del museo\ncon explicaciones\ndetalladas de cada\nexposición y obra',
            duration: '2h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-2',
            type: 'sub-activity',
            title: 'Tiempo Libre\npara Explorar',
            subtitle: 'Exploración independiente\nde las áreas exteriores\ny jardines del complejo\ncon guía de orientación',
            duration: '2h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      }
    ]
  });

  // Función para agregar un nuevo segmento después del elemento especificado
  const handleAddSegment = (afterItemId: string) => {
    const newSegment: ItineraryItem = {
      id: Date.now().toString(),
      type: 'activity',
      title: 'Nueva Actividad\nMultilínea',
      subtitle: 'Con saltos de línea\nen título y subtítulo',
      duration: '1h30min',
      icon: 'fas fa-plus-circle',
      color: 'bg-secondary text-white'
    };

    setItineraryData(prevData => {
      const currentIndex = prevData.items.findIndex(item => item.id === afterItemId);
      const newItems = [...prevData.items];
      newItems.splice(currentIndex + 1, 0, newSegment);
      return { ...prevData, items: newItems };
    });
  };

  // Función para eliminar un elemento del itinerario
  const handleItemRemove = (itemId: string) => {
    setItineraryData(prevData => ({
      ...prevData,
      items: prevData.items.filter(item => item.id !== itemId)
    }));
  };

  return (
    <div className="container mt-4">
      <h2>Ejemplo: Saltos de Línea en Todos los Elementos</h2>
      
      <div className="alert alert-success">
        <h5>Función de Cálculo Universal:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Elementos Principales:</h6>
            <ul className="mb-0">
              <li><strong>Título:</strong> Altura base 24px</li>
              <li><strong>Subtítulo:</strong> +16px + (saltos × 16px)</li>
              <li><strong>Descripción:</strong> +16px + (saltos × 16px)</li>
              <li><strong>Duración:</strong> +4px adicional</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Sub-elementos:</h6>
            <ul className="mb-0">
              <li><strong>Misma lógica:</strong> Usa la función universal</li>
              <li><strong>Consistencia:</strong> Cálculo uniforme</li>
              <li><strong>Precisión:</strong> Altura real considerada</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="alert alert-info">
        <h5>Función de Cálculo:</h5>
        <pre className="mb-0">
{`const calculateItemHeight = (item) => {
  let baseHeight = 24; // Altura base para título
  
  // Subtítulo con saltos de línea
  if (item.subtitle) {
    const lineBreaks = (item.subtitle.match(/\\n/g) || []).length;
    baseHeight += 16 + (lineBreaks * 16);
  }
  
  // Descripción con saltos de línea
  if (item.description) {
    const descLineBreaks = (item.description.match(/\\n/g) || []).length;
    baseHeight += 16 + (descLineBreaks * 16);
  }
  
  // Duración
  if (item.duration) {
    baseHeight += 4;
  }
  
  return Math.max(baseHeight, 32);
};`}
        </pre>
      </div>
      
      <div className="row">
        <div className="col-12">
          <ItinerarySchedule 
            data={itineraryData}
            editable={true}
            onItemRemove={handleItemRemove}
            onAddSegment={handleAddSegment}
          />
        </div>
      </div>
      
      <div className="mt-4">
        <h4>Verificación de Alturas Calculadas:</h4>
        <div className="row">
          <div className="col-md-6">
            <h6>Elementos Principales:</h6>
            <ul className="mb-0">
              <li><strong>Start:</strong> Título 2 líneas + descripción 3 líneas = 24 + 32 + 48 + 4 = 108px</li>
              <li><strong>Actividad 1:</strong> Título 2 líneas + subtítulo 4 líneas + duración = 24 + 32 + 64 + 4 = 124px</li>
              <li><strong>Transfer:</strong> Título 2 líneas + subtítulo 4 líneas + duración = 24 + 32 + 64 + 4 = 124px</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Sub-elementos:</h6>
            <ul className="mb-0">
              <li><strong>Parada 1:</strong> Título 2 líneas + subtítulo 3 líneas + duración = 24 + 32 + 48 + 4 = 108px</li>
              <li><strong>Parada 2:</strong> Subtítulo 4 líneas + duración = 24 + 64 + 4 = 92px</li>
              <li><strong>Parada 3:</strong> Título 2 líneas + subtítulo 4 líneas + duración = 24 + 32 + 64 + 4 = 124px</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <h5>Características del Ejemplo:</h5>
        <ul>
          <li><strong>Todos los elementos</strong> tienen saltos de línea en títulos, subtítulos o descripciones</li>
          <li><strong>Líneas de tiempo</strong> se ajustan automáticamente a la altura real</li>
          <li><strong>Conexión precisa</strong> entre centros de círculos considerando contenido multilínea</li>
          <li><strong>Consistencia visual</strong> en todo el itinerario</li>
        </ul>
      </div>
    </div>
  );
};

export default ItineraryScheduleLineBreaksAllExample;
