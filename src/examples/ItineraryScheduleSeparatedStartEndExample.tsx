import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra la nueva estructura con start y end como propiedades separadas
const ItineraryScheduleSeparatedStartEndExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Itinerario con Start y End Separados",
    start: {
      id: 'start',
      type: 'start',
      title: 'Punto de Partida',
      description: 'Lugar de inicio del tour',
      icon: 'fas fa-play',
      color: 'bg-success text-white'
    },
    end: {
      id: 'end',
      type: 'end',
      title: 'Punto Final',
      description: 'Lugar de finalización del tour',
      icon: 'fas fa-flag-checkered',
      color: 'bg-danger text-white'
    },
    items: [
      {
        id: '1',
        type: 'activity',
        title: 'Visita al Museo',
        subtitle: 'Recorrido guiado por las salas principales',
        duration: '2h30min',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '2',
        type: 'route',
        title: 'Transfer al Centro Histórico',
        subtitle: 'Viaje en transporte público',
        duration: '45min',
        icon: 'fas fa-route',
        color: 'bg-info text-white',
        subItems: []
      },
      {
        id: '3',
        type: 'activity',
        title: 'Tour por el Centro',
        subtitle: 'Visita a monumentos históricos y plazas',
        duration: '3h',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Plaza Principal',
            subtitle: 'Explicación histórica',
            duration: '30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-2',
            type: 'sub-activity',
            title: 'Catedral',
            subtitle: 'Visita guiada interior',
            duration: '1h',
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
      subtitle: 'Con start y end separados',
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

  // Función para actualizar el start
  const updateStart = () => {
    setItineraryData(prevData => ({
      ...prevData,
      start: {
        ...prevData.start,
        title: 'Nuevo Punto de Partida',
        description: 'Lugar actualizado'
      }
    }));
  };

  // Función para actualizar el end
  const updateEnd = () => {
    setItineraryData(prevData => ({
      ...prevData,
      end: {
        ...prevData.end,
        title: 'Nuevo Punto Final',
        description: 'Destino actualizado'
      }
    }));
  };

  return (
    <div className="container mt-4">
      <h2>Ejemplo: Start y End como Propiedades Separadas</h2>
      
      <div className="alert alert-success">
        <h5>Nueva Estructura de Datos:</h5>
        <div className="row">
          <div className="col-md-4">
            <h6>Start:</h6>
            <ul className="mb-0">
              <li><strong>Propiedad separada:</strong> `start: ItineraryItem`</li>
              <li><strong>Ventaja:</strong> Fácil acceso y modificación</li>
              <li><strong>Uso:</strong> Siempre al inicio</li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>End:</h6>
            <ul className="mb-0">
              <li><strong>Propiedad separada:</strong> `end: ItineraryItem`</li>
              <li><strong>Ventaja:</strong> Fácil acceso y modificación</li>
              <li><strong>Uso:</strong> Siempre al final</li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Items:</h6>
            <ul className="mb-0">
              <li><strong>Solo segmentos:</strong> Actividades y rutas</li>
              <li><strong>Ventaja:</strong> Array más limpio</li>
              <li><strong>Uso:</strong> Entre start y end</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        <button 
          className="btn btn-outline-primary btn-sm me-2"
          onClick={updateStart}
        >
          Actualizar Start
        </button>
        <button 
          className="btn btn-outline-danger btn-sm"
          onClick={updateEnd}
        >
          Actualizar End
        </button>
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
        <h4>Estructura de Datos:</h4>
        <pre className="bg-light p-3 rounded">
{`{
  title: "Itinerario con Start y End Separados",
  start: {
    id: 'start',
    type: 'start',
    title: 'Punto de Partida',
    description: 'Lugar de inicio del tour',
    icon: 'fas fa-play',
    color: 'bg-success text-white'
  },
  end: {
    id: 'end',
    type: 'end',
    title: 'Punto Final',
    description: 'Lugar de finalización del tour',
    icon: 'fas fa-flag-checkered',
    color: 'bg-danger text-white'
  },
  items: [
    // Solo actividades y rutas
    { id: '1', type: 'activity', ... },
    { id: '2', type: 'route', ... },
    { id: '3', type: 'activity', ... }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};

export default ItineraryScheduleSeparatedStartEndExample;
