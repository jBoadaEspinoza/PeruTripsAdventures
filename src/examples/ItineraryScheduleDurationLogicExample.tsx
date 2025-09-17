import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra la lógica de duración según el tipo de elemento
const ItineraryScheduleDurationLogicExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Lógica de Duración por Tipo de Elemento",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Punto de Partida',
        description: 'Lugar de inicio del tour',
        icon: 'fas fa-play',
        color: 'bg-success text-white'
      },
      {
        id: '2',
        type: 'activity',
        title: 'Visita al Museo',
        subtitle: 'Recorrido guiado por las salas principales',
        duration: '2h30min',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '3',
        type: 'route',
        title: 'Transfer al Centro Histórico',
        subtitle: 'Viaje en transporte público',
        duration: '45min',
        icon: 'fas fa-route',
        color: 'bg-info text-white',
        subItems: []
      },
      {
        id: '4',
        type: 'activity',
        title: 'Tour por el Centro',
        subtitle: 'Visita a monumentos históricos y plazas',
        duration: '3h',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '4-1',
            type: 'sub-activity',
            title: 'Plaza Principal',
            subtitle: 'Explicación histórica',
            duration: '30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '4-2',
            type: 'sub-activity',
            title: 'Catedral',
            subtitle: 'Visita guiada interior',
            duration: '1h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '5',
        type: 'end',
        title: 'Regreso al Hotel',
        description: 'Fin del tour',
        icon: 'fas fa-flag-checkered',
        color: 'bg-danger text-white'
      }
    ]
  });

  // Función para agregar un nuevo segmento después del elemento especificado
  const handleAddSegment = (afterItemId: string) => {
    const newSegment: ItineraryItem = {
      id: Date.now().toString(),
      type: 'activity',
      title: 'Nueva Actividad',
      subtitle: 'Con duración al lado del subtítulo',
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
      <h2>Ejemplo: Lógica de Duración por Tipo de Elemento</h2>
      
      <div className="alert alert-info">
        <h5>Reglas de Duración:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Actividades (type: 'activity'):</h6>
            <ul className="mb-0">
              <li><strong>Formato:</strong> subtitle - duration</li>
              <li><strong>Ejemplo:</strong> "Recorrido guiado - 2h30min"</li>
              <li><strong>Ubicación:</strong> Al lado del subtítulo</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Otros tipos (route, start, end):</h6>
            <ul className="mb-0">
              <li><strong>Formato:</strong> (duration)</li>
              <li><strong>Ejemplo:</strong> "(45min)"</li>
              <li><strong>Ubicación:</strong> Debajo del subtítulo/descripción</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="alert alert-warning">
        <h5>Comportamiento Especial:</h5>
        <ul className="mb-0">
          <li><strong>Start y End:</strong> No muestran duración (sin importar si la tienen)</li>
          <li><strong>Actividades:</strong> Duración integrada en el subtítulo</li>
          <li><strong>Rutas:</strong> Duración separada debajo</li>
        </ul>
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
        <h4>Verificación Visual:</h4>
        <div className="row">
          <div className="col-md-6">
            <h6>Actividades:</h6>
            <ul className="mb-0">
              <li><strong>Visita al Museo:</strong> "Recorrido guiado por las salas principales - 2h30min"</li>
              <li><strong>Tour por el Centro:</strong> "Visita a monumentos históricos y plazas - 3h"</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Rutas:</h6>
            <ul className="mb-0">
              <li><strong>Transfer al Centro:</strong> "Viaje en transporte público" + "(45min)"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryScheduleDurationLogicExample;
