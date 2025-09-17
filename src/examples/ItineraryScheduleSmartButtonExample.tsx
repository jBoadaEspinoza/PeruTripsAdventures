import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra la lógica inteligente del botón "Agregar nuevo segmento"
const ItineraryScheduleSmartButtonExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Itinerario con Botón Inteligente",
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

  // Función para resetear a estado inicial (solo Start y End)
  const resetToInitial = () => {
    setItineraryData({
      title: "Itinerario con Botón Inteligente",
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
          type: 'end',
          title: 'Fin: Regreso',
          description: 'Punto final',
          icon: 'fas fa-home',
          color: 'bg-danger text-white'
        }
      ]
    });
  };

  // Contar segmentos (solo actividades y rutas)
  const segments = itineraryData.items.filter(item => 
    item.type === 'activity' || item.type === 'route'
  );

  return (
    <div className="container mt-4">
      <h2>Ejemplo: Botón "Agregar nuevo segmento" Inteligente</h2>
      
      <div className="alert alert-success">
        <h5>Lógica del Botón:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Estado Actual:</h6>
            <p className="mb-1">
              <strong>Segmentos (actividades/rutas):</strong> {segments.length}
            </p>
            <p className="mb-0">
              <strong>Ubicación del botón:</strong> {
                segments.length > 0 
                  ? `Entre el último segmento (${segments[segments.length - 1].title}) y End`
                  : 'Entre Start y End'
              }
            </p>
          </div>
          <div className="col-md-6">
            <h6>Comportamiento:</h6>
            <ul className="mb-0">
              <li><strong>Sin segmentos:</strong> Botón aparece entre Start y End</li>
              <li><strong>Con segmentos:</strong> Botón aparece entre el último segmento y End</li>
              <li><strong>Un solo botón:</strong> Siempre entre Start y End</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <button 
          className="btn btn-warning btn-sm me-2"
          onClick={resetToInitial}
        >
          <i className="fas fa-undo me-1"></i>
          Resetear a Solo Start/End
        </button>
        <span className="text-muted">
          Haz clic para ver el botón entre Start y End
        </span>
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
        <h4>Instrucciones:</h4>
        <ol>
          <li><strong>Estado inicial:</strong> Solo Start y End - el botón aparece entre Start y End</li>
          <li><strong>Agregar segmento:</strong> El botón se mueve entre el nuevo segmento y End</li>
          <li><strong>Agregar más segmentos:</strong> El botón siempre aparece entre el último segmento y End</li>
          <li><strong>Eliminar segmentos:</strong> El botón se ajusta automáticamente</li>
        </ol>
      </div>
    </div>
  );
};

export default ItineraryScheduleSmartButtonExample;
