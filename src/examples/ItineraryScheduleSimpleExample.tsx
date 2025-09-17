import React from 'react';
import ItinerarySchedule, { ItineraryData } from '../components/ItinerarySchedule';

// Ejemplo simple que demuestra la funcionalidad de eliminación
const ItineraryScheduleSimpleExample: React.FC = () => {
  // Datos de ejemplo con sub-items
  const exampleData: ItineraryData = {
    title: "Itinerario de Ejemplo - Modo Editable",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Punto de partida: Hotel',
        description: 'Recogida en hotel',
        icon: 'fas fa-home',
        color: 'bg-success text-white'
      },
      {
        id: '2',
        type: 'activity',
        title: 'Visita al Centro Histórico',
        description: 'Tour guiado (3 horas)',
        icon: 'fas fa-camera',
        color: 'bg-primary text-white',
        subItems: [
          {
            id: '2-1',
            type: 'sub-activity',
            title: 'Plaza Mayor (1h)',
            icon: 'fas fa-square',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-2',
            type: 'sub-activity',
            title: 'Catedral (1h)',
            icon: 'fas fa-church',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-3',
            type: 'sub-activity',
            title: 'Mercado (1h)',
            icon: 'fas fa-store',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '3',
        type: 'route',
        title: 'Transfer al Aeropuerto',
        description: 'Viaje en bus (45min)',
        icon: 'fas fa-bus',
        color: 'bg-info text-white'
      },
      {
        id: '4',
        type: 'end',
        title: 'Regreso a casa',
        description: 'Vuelo de retorno',
        icon: 'fas fa-plane',
        color: 'bg-danger text-white'
      }
    ]
  };

  return (
    <div className="container mt-4">
      <h2>Ejemplo de ItinerarySchedule con Botones Funcionales</h2>
      
      <div className="alert alert-info">
        <h5>Instrucciones:</h5>
        <ul className="mb-0">
          <li><strong>Elementos movibles:</strong> Actividades y rutas (botones ↑ ↓)</li>
          <li><strong>Restricciones de movimiento:</strong> No se puede mover arriba del Start ni abajo del End</li>
          <li><strong>Menú contextual:</strong> Botón de 3 puntos (⋯) con opciones "Agregar Segmento" y "Eliminar Segmento"</li>
          <li><strong>Sub-elementos:</strong> Botones de movimiento y eliminación individuales</li>
          <li><strong>Elementos protegidos:</strong> Start y End no muestran opción de eliminación</li>
        </ul>
      </div>
      
      <div className="row">
        <div className="col-12">
          <ItinerarySchedule 
            data={exampleData}
            editable={true}
          />
        </div>
      </div>
      
      <div className="mt-4">
        <h4>Modo Solo Lectura (sin botones)</h4>
        <ItinerarySchedule 
          data={exampleData}
          editable={false}
        />
      </div>
    </div>
  );
};

export default ItineraryScheduleSimpleExample;
