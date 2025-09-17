import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData } from '../components/ItinerarySchedule';

// Ejemplo de uso del componente ItinerarySchedule con datos dinámicos
const ItineraryScheduleExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Mi Itinerario Personalizado",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Punto de partida: Lima',
        description: 'Recogida en hotel (30min)',
        icon: 'fas fa-map-marker-alt',
        color: 'bg-success text-white'
      },
      {
        id: '2',
        type: 'route',
        title: 'Viaje a Cusco',
        description: 'Vuelo doméstico (1h30min)',
        icon: 'fas fa-plane',
        color: 'bg-info text-white'
      },
      {
        id: '3',
        type: 'activity',
        title: 'City Tour Cusco',
        description: 'Visita guiada por la ciudad (4h)',
        icon: 'fas fa-camera',
        color: 'bg-primary text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Plaza de Armas (1h)',
            icon: 'fas fa-square',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-2',
            type: 'sub-activity',
            title: 'Sacsayhuamán (2h)',
            icon: 'fas fa-mountain',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '4',
        type: 'activity',
        title: 'Machu Picchu',
        description: 'Visita al santuario (6h)',
        icon: 'fas fa-mountain',
        color: 'bg-warning text-white'
      },
      {
        id: '5',
        type: 'end',
        title: 'Regreso a Lima',
        description: 'Vuelo de retorno (1h30min)',
        icon: 'fas fa-home',
        color: 'bg-danger text-white'
      }
    ]
  });

  // Función para eliminar un elemento del itinerario
  const handleItemRemove = (itemId: string) => {
    setItineraryData(prevData => ({
      ...prevData,
      items: prevData.items.filter(item => item.id !== itemId)
    }));
  };

  // Función para eliminar un sub-item
  const handleSubItemRemove = (itemId: string, subItemId: string) => {
    setItineraryData(prevData => ({
      ...prevData,
      items: prevData.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            subItems: item.subItems?.filter(subItem => subItem.id !== subItemId)
          };
        }
        return item;
      })
    }));
  };

  return (
    <div className="container mt-4">
      <h2>Ejemplo de ItinerarySchedule Dinámico</h2>
      
      {/* Usando datos personalizados */}
      <div className="row">
        <div className="col-md-6">
          <h4>Itinerario Editable</h4>
          <ItinerarySchedule 
            data={itineraryData}
            editable={true}
            onItemRemove={handleItemRemove}
            onSubItemRemove={handleSubItemRemove}
          />
        </div>
        
        <div className="col-md-6">
          <h4>Itinerario Solo Lectura</h4>
          <ItinerarySchedule 
            data={itineraryData}
            editable={false}
          />
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <h4>Itinerario por Defecto</h4>
          <ItinerarySchedule />
        </div>
      </div>
    </div>
  );
};

export default ItineraryScheduleExample;
