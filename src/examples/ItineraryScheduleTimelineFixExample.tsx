import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra la corrección de la línea de tiempo
const ItineraryScheduleTimelineFixExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Línea de Tiempo Corregida",
    start: {
      id: 'start',
      type: 'start',
      title: 'Inicio del Tour',
      description: 'Punto de partida',
      icon: 'fas fa-play',
      color: 'bg-success text-white'
    },
    end: {
      id: 'end',
      type: 'end',
      title: 'Fin del Tour',
      description: 'Punto de llegada',
      icon: 'fas fa-flag-checkered',
      color: 'bg-danger text-white'
    },
    items: [
      {
        id: '1',
        type: 'activity',
        title: 'Actividad 1',
        subtitle: 'Sin sub-actividades',
        duration: '1h',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '2',
        type: 'route',
        title: 'Transfer Largo',
        subtitle: 'Con muchas sub-actividades',
        duration: '2h',
        icon: 'fas fa-route',
        color: 'bg-info text-white',
        subItems: [
          {
            id: '2-1',
            type: 'sub-activity',
            title: 'Parada 1',
            subtitle: 'Descanso y fotos',
            duration: '15min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-2',
            type: 'sub-activity',
            title: 'Parada 2',
            subtitle: 'Almuerzo en restaurante local',
            duration: '45min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-3',
            type: 'sub-activity',
            title: 'Parada 3',
            subtitle: 'Visita rápida al mirador',
            duration: '20min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-4',
            type: 'sub-activity',
            title: 'Parada 4',
            subtitle: 'Compras de souvenirs',
            duration: '30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '3',
        type: 'activity',
        title: 'Actividad Final',
        subtitle: 'Con sub-actividades',
        duration: '2h30min',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Visita Guiada',
            subtitle: 'Museo principal',
            duration: '1h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-2',
            type: 'sub-activity',
            title: 'Tiempo Libre',
            subtitle: 'Exploración independiente',
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
      subtitle: 'Con línea corregida',
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
      <h2>Ejemplo: Línea de Tiempo Corregida</h2>
      
      <div className="alert alert-success">
        <h5>Corrección Aplicada:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Problema Anterior:</h6>
            <ul className="mb-0">
              <li><strong>Línea excedía:</strong> Se extendía más allá del End</li>
              <li><strong>Cálculo incorrecto:</strong> Usaba altura completa del End</li>
              <li><strong>Visual:</strong> Línea desbordada</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Solución Implementada:</h6>
            <ul className="mb-0">
              <li><strong>Altura fija:</strong> 20px para conectar al End</li>
              <li><strong>Detección:</strong> Identifica cuando conecta al End</li>
              <li><strong>Resultado:</strong> Línea termina exactamente en el centro del End</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="alert alert-info">
        <h5>Lógica de Cálculo:</h5>
        <pre className="mb-0">
{`// Detectar si conecta al End
const isConnectingToEnd = index === itineraryData.items.length - 1 && itineraryData.end;

// Calcular altura de la línea
const lineHeight = isConnectingToEnd 
  ? totalItemHeight + marginBetween + 20 // Altura fija para End
  : totalItemHeight + marginBetween + (nextItemHeight / 2); // Altura normal`}
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
        <h4>Verificación Visual:</h4>
        <ul>
          <li><strong>Start → Actividad 1:</strong> Línea normal (elemento simple)</li>
          <li><strong>Actividad 1 → Transfer:</strong> Línea normal (elemento simple → elemento con sub-actividades)</li>
          <li><strong>Transfer → Actividad Final:</strong> Línea larga (elemento con muchas sub-actividades → elemento con sub-actividades)</li>
          <li><strong>Actividad Final → End:</strong> Línea corregida (termina exactamente en el centro del End)</li>
        </ul>
      </div>
    </div>
  );
};

export default ItineraryScheduleTimelineFixExample;
