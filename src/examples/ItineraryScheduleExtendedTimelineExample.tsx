import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData, ItineraryItem } from '../components/ItinerarySchedule';

// Ejemplo que demuestra la línea de tiempo extendida mejorada
const ItineraryScheduleExtendedTimelineExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Línea de Tiempo Extendida Mejorada",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Inicio del Día',
        description: 'Punto de partida',
        duration: '30min',
        icon: 'fas fa-sun',
        color: 'bg-warning text-white'
      },
      {
        id: '2',
        type: 'activity',
        title: 'Actividad Matutina',
        subtitle: 'Sin sub-actividades',
        duration: '2h',
        icon: 'fas fa-star',
        color: 'bg-primary text-white',
        subItems: []
      },
      {
        id: '3',
        type: 'route',
        title: 'Transfer Largo con Múltiples Paradas',
        subtitle: 'Viaje con muchas actividades',
        duration: '4h',
        icon: 'fas fa-route',
        color: 'bg-info text-white',
        subItems: [
          {
            id: '3-1',
            type: 'sub-activity',
            title: 'Parada de Desayuno',
            subtitle: 'Restaurante local',
            duration: '45min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-2',
            type: 'sub-activity',
            title: 'Mirador Principal',
            subtitle: 'Fotos panorámicas',
            duration: '30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-3',
            type: 'sub-activity',
            title: 'Mercado Artesanal',
            subtitle: 'Compras y souvenirs',
            duration: '1h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-4',
            type: 'sub-activity',
            title: 'Almuerzo Típico',
            subtitle: 'Restaurante tradicional',
            duration: '1h30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-5',
            type: 'sub-activity',
            title: 'Visita a Iglesia',
            subtitle: 'Arquitectura colonial',
            duration: '30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '3-6',
            type: 'sub-activity',
            title: 'Parada Final',
            subtitle: 'Preparación para actividad',
            duration: '15min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '4',
        type: 'activity',
        title: 'Actividad Principal del Día',
        subtitle: 'Con sub-actividades detalladas',
        duration: '3h',
        icon: 'fas fa-star',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '4-1',
            type: 'sub-activity',
            title: 'Visita Guiada Completa',
            subtitle: 'Museo histórico',
            duration: '1h30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '4-2',
            type: 'sub-activity',
            title: 'Tiempo Libre para Explorar',
            subtitle: 'Áreas exteriores',
            duration: '1h',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          },
          {
            id: '4-3',
            type: 'sub-activity',
            title: 'Sesión de Fotos',
            subtitle: 'Puntos icónicos',
            duration: '30min',
            icon: 'fas fa-circle',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '5',
        type: 'end',
        title: 'Regreso al Hotel',
        description: 'Fin del día',
        duration: '1h',
        icon: 'fas fa-moon',
        color: 'bg-dark text-white'
      }
    ]
  });

  // Función para agregar un nuevo segmento después del elemento especificado
  const handleAddSegment = (afterItemId: string) => {
    const newSegment: ItineraryItem = {
      id: Date.now().toString(),
      type: 'activity',
      title: 'Nuevo Segmento',
      subtitle: 'Con línea extendida mejorada',
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
      <h2>Ejemplo: Línea de Tiempo Extendida Mejorada</h2>
      
      <div className="alert alert-success">
        <h5>Extensión Mejorada:</h5>
        <p className="mb-0">
          <strong>Nuevos valores de margen:</strong> 20px para elementos simples y 48px para elementos con sub-actividades.<br/>
          <strong>Resultado:</strong> La línea de tiempo ahora se extiende correctamente hasta el centro del siguiente punto.
        </p>
      </div>
      
      <div className="alert alert-info">
        <h5>Valores de Margen Actualizados:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Elementos Simples:</h6>
            <ul className="mb-0">
              <li><strong>Margen anterior:</strong> 12px</li>
              <li><strong>Margen actual:</strong> 20px (+67%)</li>
              <li><strong>Mejora:</strong> Mayor separación visual</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Elementos con Sub-actividades:</h6>
            <ul className="mb-0">
              <li><strong>Margen anterior:</strong> 24px</li>
              <li><strong>Margen actual:</strong> 48px (+100%)</li>
              <li><strong>Mejora:</strong> Extensión completa hasta el siguiente punto</li>
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
        <h4>Verificación de Conexiones:</h4>
        <div className="row">
          <div className="col-md-6">
            <h6>Elementos Simples:</h6>
            <ul className="mb-0">
              <li><strong>Inicio → Actividad Matutina:</strong> Línea con margen de 20px</li>
              <li><strong>Actividad Principal → Fin:</strong> Línea con margen de 20px</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Elementos con Sub-actividades:</h6>
            <ul className="mb-0">
              <li><strong>Actividad Matutina → Transfer:</strong> Línea con margen de 20px</li>
              <li><strong>Transfer → Actividad Principal:</strong> Línea con margen de 48px</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryScheduleExtendedTimelineExample;
