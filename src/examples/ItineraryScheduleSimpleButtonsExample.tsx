import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo simple que demuestra los botones "Agregar nuevo segmento"
const ItineraryScheduleSimpleButtonsExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Itinerario con Botones de Agregar",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Inicio: Lima',
        description: 'Punto de partida',
        icon: 'fas fa-map-marker-alt',
        color: 'bg-success text-white'
      },
      {
        id: '2',
        type: 'activity',
        title: 'City Tour',
        description: 'Visita guiada (4h)',
        icon: 'fas fa-camera',
        color: 'bg-primary text-white'
      },
      {
        id: '3',
        type: 'end',
        title: 'Fin: Regreso',
        description: 'Punto final',
        icon: 'fas fa-home',
        color: 'bg-danger text-white'
      }
    ]
  });

  // Función para agregar un nuevo segmento después del elemento especificado
  const handleAddSegment = (afterItemId: string) => {
    const newSegment: ItineraryItem = {
      id: Date.now().toString(),
      type: 'activity',
      title: 'Nuevo Segmento',
      description: 'Descripción del nuevo segmento',
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
      <h2>Ejemplo: Botones "Agregar nuevo segmento"</h2>
      
      <div className="alert alert-info">
        <h5>Características:</h5>
        <ul className="mb-0">
          <li><strong>Start y End:</strong> Sin botones de control, solo visualización</li>
          <li><strong>Un solo botón:</strong> "Agregar nuevo segmento" siempre entre Start y End</li>
          <li><strong>Con segmentos:</strong> Botón aparece entre el último segmento y End</li>
          <li><strong>Sin segmentos:</strong> Botón aparece entre Start y End</li>
          <li><strong>Actividades/Rutas:</strong> Tienen menú contextual (⋯) con opciones</li>
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
        <h4>Modo Solo Lectura</h4>
        <p className="text-muted">En modo solo lectura no se muestran botones ni menús</p>
        <ItinerarySchedule 
          data={itineraryData}
          editable={false}
        />
      </div>
    </div>
  );
};

export default ItineraryScheduleSimpleButtonsExample;
