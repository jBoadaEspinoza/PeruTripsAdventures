import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra el manejo de saltos de línea en subtítulos
const ItineraryScheduleLineBreaksExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Manejo de Saltos de Línea en Subtítulos",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Inicio del Tour',
        description: 'Punto de partida',
        duration: '30min',
        icon: 'fas fa-play',
        color: 'bg-success text-white'
      },
      {
        id: '2',
        type: 'activity',
        title: 'Visita al Centro Histórico',
        subtitle: 'Recorrido guiado por la ciudad',
        duration: '2h',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: [
          {
            id: '2-1',
            type: 'sub-activity',
            title: 'Plaza Principal',
            subtitle: 'Visita a la plaza\ncon arquitectura colonial\ny monumentos históricos',
            duration: '45min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-2',
            type: 'sub-activity',
            title: 'Catedral',
            subtitle: 'Visita guiada\na la catedral\ncon explicaciones históricas\ny arquitectónicas',
            duration: '1h15min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '3',
        type: 'route',
        title: 'Transfer al Museo',
        subtitle: 'Viaje en transporte\ndesde el centro\na la zona cultural',
        duration: '30min',
        icon: 'fas fa-route',
        color: 'bg-info text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Parada Intermedia',
            subtitle: 'Breve parada\npara estirar las piernas\ny tomar fotos\ndel paisaje urbano',
            duration: '10min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '4',
        type: 'activity',
        title: 'Museo de Arte',
        subtitle: 'Visita completa\nal museo principal',
        duration: '2h30min',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '4-1',
            type: 'sub-activity',
            title: 'Exposición Principal',
            subtitle: 'Recorrido por las salas\nprincipales del museo\ncon obras de arte\ncontemporáneo y clásico',
            duration: '1h30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '4-2',
            type: 'sub-activity',
            title: 'Exposición Temporal',
            subtitle: 'Visita a la exposición\ntemporal de arte\nmoderno con guía\nespecializado',
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
        duration: '45min',
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
      subtitle: 'Con subtítulo\nmultilínea\ny duración',
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
      <h2>Ejemplo: Manejo de Saltos de Línea en Subtítulos</h2>
      
      <div className="alert alert-info">
        <h5>Cálculo Inteligente de Altura:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Función de Cálculo:</h6>
            <ul className="mb-0">
              <li><strong>Altura base:</strong> 24px por sub-actividad</li>
              <li><strong>Subtítulo:</strong> +16px por línea</li>
              <li><strong>Saltos de línea:</strong> +16px por cada \n</li>
              <li><strong>Duración:</strong> +4px adicional</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Resultado:</h6>
            <ul className="mb-0">
              <li><strong>Línea de tiempo:</strong> Se ajusta automáticamente</li>
              <li><strong>Espaciado:</strong> Correcto entre elementos</li>
              <li><strong>Visualización:</strong> Sin solapamientos</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="alert alert-warning">
        <h5>Subtítulos con Saltos de Línea:</h5>
        <p className="mb-0">
          Observa cómo los subtítulos con múltiples líneas (usando \n) se calculan correctamente 
          para ajustar la altura de la línea de tiempo y evitar solapamientos visuales.
        </p>
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
        <h4>Verificación de Altura:</h4>
        <div className="row">
          <div className="col-md-6">
            <h6>Sub-actividades con Saltos de Línea:</h6>
            <ul className="mb-0">
              <li><strong>Plaza Principal:</strong> 3 líneas = 24 + 16 + (2×16) = 72px</li>
              <li><strong>Catedral:</strong> 4 líneas = 24 + 16 + (3×16) = 88px</li>
              <li><strong>Parada Intermedia:</strong> 4 líneas = 24 + 16 + (3×16) = 88px</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Sub-actividades Simples:</h6>
            <ul className="mb-0">
              <li><strong>Exposición Principal:</strong> 4 líneas = 24 + 16 + (3×16) = 88px</li>
              <li><strong>Exposición Temporal:</strong> 3 líneas = 24 + 16 + (2×16) = 72px</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryScheduleLineBreaksExample;
