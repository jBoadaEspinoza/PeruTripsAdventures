import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra el formato mejorado con título, subtítulo y duración
const ItineraryScheduleFormattedExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Itinerario con Formato Mejorado",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Lugar de recogida: Edinburgh',
        description: 'Bus ride',
        duration: '1h30min',
        icon: 'fas fa-home',
        color: 'bg-warning text-white'
      },
      {
        id: '2',
        type: 'route',
        title: 'Glencoe',
        subtitle: 'Photo stop',
        duration: '3h',
        icon: 'fas fa-route',
        color: 'bg-white border border-dark text-dark'
      },
      {
        id: '3',
        type: 'activity',
        title: 'Loch Ness',
        subtitle: 'Free time',
        duration: '3h',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Urquhart Castle',
            subtitle: 'Guided visit',
            duration: '3h',
            icon: 'fas fa-circle',
            color: 'bg-white border border-dark text-dark'
          },
          {
            id: '3-2',
            type: 'sub-activity',
            title: 'Nessie Museum',
            subtitle: 'Optional, Extra fee',
            duration: '1h',
            icon: 'fas fa-circle',
            color: 'bg-white border border-dark text-dark'
          }
        ]
      },
      {
        id: '4',
        type: 'activity',
        title: 'Pitlochry',
        subtitle: 'Free time',
        duration: '2h',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '5',
        type: 'end',
        title: 'Regresa a: Edinburgh',
        description: 'Bus ride',
        duration: '1h30min',
        icon: 'fas fa-home',
        color: 'bg-warning text-white'
      }
    ]
  });

  // Función para agregar un nuevo segmento después del elemento especificado
  const handleAddSegment = (afterItemId: string) => {
    const newSegment: ItineraryItem = {
      id: Date.now().toString(),
      type: 'activity',
      title: 'Nuevo Segmento',
      subtitle: 'Descripción del segmento',
      duration: '2h',
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
      <h2>Ejemplo: Formato Mejorado con Título, Subtítulo y Duración</h2>
      
      <div className="alert alert-success">
        <h5>Formato de Elementos:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Elementos Principales:</h6>
            <ul className="mb-0">
              <li><strong>Título:</strong> En negrita y color primario</li>
              <li><strong>Subtítulo:</strong> Debajo en texto muted</li>
              <li><strong>Duración:</strong> Al lado entre paréntesis</li>
              <li><strong>Descripción:</strong> Debajo del subtítulo</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Sub-elementos:</h6>
            <ul className="mb-0">
              <li><strong>Título:</strong> En negrita y color primario (tamaño pequeño)</li>
              <li><strong>Subtítulo:</strong> Debajo en texto muted (tamaño pequeño)</li>
              <li><strong>Duración:</strong> Al lado entre paréntesis (tamaño pequeño)</li>
            </ul>
          </div>
        </div>
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
        <p className="text-muted">En modo solo lectura se mantiene el mismo formato visual</p>
        <ItinerarySchedule 
          data={itineraryData}
          editable={false}
        />
      </div>
    </div>
  );
};

export default ItineraryScheduleFormattedExample;
