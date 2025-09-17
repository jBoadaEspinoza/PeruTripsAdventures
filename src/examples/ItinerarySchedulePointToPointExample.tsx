import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra las líneas de tiempo punto a punto considerando sub-actividades
const ItinerarySchedulePointToPointExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Líneas Punto a Punto con Sub-actividades",
    start: {
      id: 'start',
      type: 'start',
      title: 'Punto de Partida',
      description: 'Inicio del itinerario',
      icon: 'fas fa-play',
      color: 'bg-success text-white'
    },
    end: {
      id: 'end',
      type: 'end',
      title: 'Punto Final',
      description: 'Fin del itinerario',
      icon: 'fas fa-flag-checkered',
      color: 'bg-danger text-white'
    },
    items: [
      {
        id: '1',
        type: 'activity',
        title: 'Actividad Simple',
        subtitle: 'Sin sub-actividades',
        duration: '1h',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '2',
        type: 'route',
        title: 'Transfer con Sub-actividades',
        subtitle: 'Viaje con múltiples paradas',
        duration: '2h30min',
        icon: 'fas fa-route',
        color: 'bg-info text-white',
        subItems: [
          {
            id: '2-1',
            type: 'sub-activity',
            title: 'Parada 1',
            subtitle: 'Descanso y estiramiento',
            duration: '15min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-2',
            type: 'sub-activity',
            title: 'Parada 2',
            subtitle: 'Almuerzo en restaurante\ntradicional con vista\nal mar',
            duration: '1h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-3',
            type: 'sub-activity',
            title: 'Parada 3',
            subtitle: 'Visita al mirador\npanorámico para fotos\ny descanso',
            duration: '30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-4',
            type: 'sub-activity',
            title: 'Parada 4',
            subtitle: 'Compras de souvenirs\ny artesanías locales',
            duration: '45min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '3',
        type: 'activity',
        title: 'Actividad Principal',
        subtitle: 'Con sub-actividades detalladas',
        duration: '3h',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Visita Guiada',
            subtitle: 'Recorrido por las salas\nprincipales del museo\ncon explicaciones\ndetalladas',
            duration: '1h30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-2',
            type: 'sub-activity',
            title: 'Tiempo Libre',
            subtitle: 'Exploración independiente\nde las áreas exteriores\ny jardines',
            duration: '1h30min',
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
      title: 'Nueva Actividad',
      subtitle: 'Con líneas punto a punto',
      duration: '1h',
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
      <h2>Ejemplo: Líneas Punto a Punto con Sub-actividades</h2>
      
      <div className="alert alert-success">
        <h5>Nueva Lógica de Líneas:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Cálculo Preciso:</h6>
            <ul className="mb-0">
              <li><strong>Centro a centro:</strong> Línea va del centro de un círculo al centro del siguiente</li>
              <li><strong>Sub-actividades:</strong> Considera la altura real de las sub-actividades</li>
              <li><strong>Saltos de línea:</strong> Calcula altura considerando \n en subtítulos</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Fórmula de Cálculo:</h6>
            <ul className="mb-0">
              <li><strong>Inicio:</strong> Centro del círculo actual (20px)</li>
              <li><strong>Fin:</strong> Fondo del elemento + margen + centro del siguiente</li>
              <li><strong>Altura:</strong> Fin - Inicio = distancia exacta</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="alert alert-info">
        <h5>Cálculo de Altura de Sub-actividades:</h5>
        <pre className="mb-0">
{`const calculateSubItemHeight = (subItem) => {
  let baseHeight = 24; // Altura base para título
  
  if (subItem.subtitle) {
    const lineBreaks = (subItem.subtitle.match(/\\n/g) || []).length;
    baseHeight += 16 + (lineBreaks * 16); // 16px por línea
  }
  
  if (subItem.duration) {
    baseHeight += 4; // Espaciado adicional
  }
  
  return Math.max(baseHeight, 32); // Mínimo 32px
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
        <h4>Verificación de Conexiones:</h4>
        <div className="row">
          <div className="col-md-6">
            <h6>Elementos Simples:</h6>
            <ul className="mb-0">
              <li><strong>Start → Actividad Simple:</strong> Línea corta y precisa</li>
              <li><strong>Actividad Simple → Transfer:</strong> Línea media</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Elementos con Sub-actividades:</h6>
            <ul className="mb-0">
              <li><strong>Transfer → Actividad Principal:</strong> Línea larga (considera sub-actividades)</li>
              <li><strong>Actividad Principal → End:</strong> Línea larga (considera sub-actividades)</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <h5>Características de las Sub-actividades:</h5>
        <ul>
          <li><strong>Parada 2:</strong> 3 saltos de línea = altura extendida</li>
          <li><strong>Parada 3:</strong> 2 saltos de línea = altura media</li>
          <li><strong>Visita Guiada:</strong> 3 saltos de línea = altura extendida</li>
          <li><strong>Tiempo Libre:</strong> 2 saltos de línea = altura media</li>
        </ul>
      </div>
    </div>
  );
};

export default ItinerarySchedulePointToPointExample;
