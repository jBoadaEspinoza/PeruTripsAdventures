import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo específico que demuestra la línea de tiempo con sub-actividades
const ItineraryScheduleSubItemsTimelineExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Línea de Tiempo con Sub-actividades",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Inicio',
        description: 'Punto de partida',
        duration: '30min',
        icon: 'fas fa-play',
        color: 'bg-success text-white'
      },
      {
        id: '2',
        type: 'activity',
        title: 'Actividad Simple',
        subtitle: 'Sin sub-actividades',
        duration: '1h',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '3',
        type: 'route',
        title: 'Transfer con Sub-actividades',
        subtitle: 'Muchas paradas',
        duration: '3h',
        icon: 'fas fa-route',
        color: 'bg-info text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Parada 1',
            subtitle: 'Descanso',
            duration: '15min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-2',
            type: 'sub-activity',
            title: 'Parada 2',
            subtitle: 'Fotos',
            duration: '20min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-3',
            type: 'sub-activity',
            title: 'Parada 3',
            subtitle: 'Almuerzo',
            duration: '45min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-4',
            type: 'sub-activity',
            title: 'Parada 4',
            subtitle: 'Compras',
            duration: '30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-5',
            type: 'sub-activity',
            title: 'Parada 5',
            subtitle: 'Visita rápida',
            duration: '20min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '4',
        type: 'activity',
        title: 'Actividad Final',
        subtitle: 'Con pocas sub-actividades',
        duration: '2h',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '4-1',
            type: 'sub-activity',
            title: 'Visita Guiada',
            subtitle: 'Museo',
            duration: '1h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '4-2',
            type: 'sub-activity',
            title: 'Tiempo Libre',
            subtitle: 'Exploración',
            duration: '1h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '5',
        type: 'end',
        title: 'Fin',
        description: 'Punto final',
        duration: '30min',
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
      title: 'Nuevo Segmento',
      subtitle: 'Con línea extendida',
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
      <h2>Ejemplo: Línea de Tiempo con Sub-actividades</h2>
      
      <div className="alert alert-warning">
        <h5>Problema Corregido:</h5>
        <p className="mb-0">
          <strong>Antes:</strong> La línea de tiempo no se extendía correctamente cuando un segmento tenía sub-actividades.<br/>
          <strong>Ahora:</strong> La línea se extiende dinámicamente considerando el margen adicional necesario para elementos con sub-actividades.
        </p>
      </div>
      
      <div className="alert alert-info">
        <h5>Cálculo de Altura Mejorado:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Elementos Simples:</h6>
            <ul className="mb-0">
              <li><strong>Margen:</strong> 20px entre elementos</li>
              <li><strong>Línea:</strong> Altura básica + margen + mitad del siguiente</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Elementos con Sub-actividades:</h6>
            <ul className="mb-0">
              <li><strong>Margen:</strong> 48px entre elementos (más del doble)</li>
              <li><strong>Línea:</strong> Altura extendida + margen mayor + mitad del siguiente</li>
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
        <h4>Verificación Visual:</h4>
        <ul>
          <li><strong>Inicio → Actividad Simple:</strong> Línea corta (sin sub-actividades)</li>
          <li><strong>Actividad Simple → Transfer:</strong> Línea media (elemento simple → elemento con sub-actividades)</li>
          <li><strong>Transfer → Actividad Final:</strong> Línea larga (elemento con muchas sub-actividades → elemento con pocas sub-actividades)</li>
          <li><strong>Actividad Final → Fin:</strong> Línea media (elemento con sub-actividades → elemento simple)</li>
        </ul>
      </div>
    </div>
  );
};

export default ItineraryScheduleSubItemsTimelineExample;
