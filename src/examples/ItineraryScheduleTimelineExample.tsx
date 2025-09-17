import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra la línea de tiempo extendida hasta el siguiente punto
const ItineraryScheduleTimelineExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Itinerario con Línea de Tiempo Extendida",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Punto de Partida',
        description: 'Inicio del viaje',
        duration: '30min',
        icon: 'fas fa-play',
        color: 'bg-success text-white'
      },
      {
        id: '2',
        type: 'activity',
        title: 'Actividad Corta',
        subtitle: 'Sin sub-actividades',
        duration: '1h',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '3',
        type: 'route',
        title: 'Transfer Largo',
        subtitle: 'Con muchas sub-actividades',
        duration: '2h',
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
          }
        ]
      },
      {
        id: '4',
        type: 'activity',
        title: 'Actividad Principal',
        subtitle: 'Con sub-actividades',
        duration: '3h',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '4-1',
            type: 'sub-activity',
            title: 'Visita Guiada',
            subtitle: 'Museo',
            duration: '1h30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '4-2',
            type: 'sub-activity',
            title: 'Tiempo Libre',
            subtitle: 'Exploración',
            duration: '1h30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '5',
        type: 'end',
        title: 'Punto Final',
        description: 'Fin del viaje',
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
      <h2>Ejemplo: Línea de Tiempo Extendida</h2>
      
      <div className="alert alert-info">
        <h5>Características de la Línea de Tiempo:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Conectividad Visual:</h6>
            <ul className="mb-0">
              <li><strong>Línea continua:</strong> Conecta cada punto con el siguiente</li>
              <li><strong>Extensión inteligente:</strong> Se adapta a la altura de los elementos</li>
              <li><strong>Conexión precisa:</strong> Llega hasta el centro del siguiente punto</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Adaptabilidad:</h6>
            <ul className="mb-0">
              <li><strong>Elementos simples:</strong> Línea corta entre puntos</li>
              <li><strong>Elementos complejos:</strong> Línea larga para sub-actividades</li>
              <li><strong>Cálculo dinámico:</strong> Altura basada en contenido real</li>
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
        <h4>Observaciones:</h4>
        <ul>
          <li><strong>Punto 1 → Punto 2:</strong> Línea corta (elemento simple)</li>
          <li><strong>Punto 2 → Punto 3:</strong> Línea larga (elemento con muchas sub-actividades)</li>
          <li><strong>Punto 3 → Punto 4:</strong> Línea media (elemento con sub-actividades)</li>
          <li><strong>Punto 4 → Punto 5:</strong> Línea corta (elemento final)</li>
        </ul>
      </div>
    </div>
  );
};

export default ItineraryScheduleTimelineExample;
