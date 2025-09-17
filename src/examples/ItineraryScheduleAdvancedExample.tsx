import React, { useState } from 'react';
import ItinerarySchedule, { ItineraryData } from '../components/ItinerarySchedule';

// Ejemplo avanzado que demuestra todas las funcionalidades
const ItineraryScheduleAdvancedExample: React.FC = () => {
  // Estado para manejar los datos del itinerario
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    title: "Itinerario Avanzado - Control Completo",
    items: [
      {
        id: '1',
        type: 'start',
        title: 'Punto de partida: Lima',
        description: 'Recogida en hotel',
        icon: 'fas fa-map-marker-alt',
        color: 'bg-success text-white'
      },
      {
        id: '2',
        type: 'activity',
        title: 'City Tour Lima',
        description: 'Visita guiada por la ciudad (4h)',
        icon: 'fas fa-camera',
        color: 'bg-primary text-white',
        subItems: [
          {
            id: '2-1',
            type: 'sub-activity',
            title: 'Plaza de Armas (1h)',
            icon: 'fas fa-square',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-2',
            type: 'sub-activity',
            title: 'Catedral (1h)',
            icon: 'fas fa-church',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-3',
            type: 'sub-activity',
            title: 'Mercado (1h)',
            icon: 'fas fa-store',
            color: 'bg-light text-dark border'
          },
          {
            id: '2-4',
            type: 'sub-activity',
            title: 'Museo (1h)',
            icon: 'fas fa-museum',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '3',
        type: 'route',
        title: 'Transfer a Cusco',
        description: 'Vuelo doméstico (1h30min)',
        icon: 'fas fa-plane',
        color: 'bg-info text-white'
      },
      {
        id: '4',
        type: 'activity',
        title: 'Machu Picchu',
        description: 'Visita al santuario (6h)',
        icon: 'fas fa-mountain',
        color: 'bg-warning text-white',
        subItems: [
          {
            id: '4-1',
            type: 'sub-activity',
            title: 'Tren a Aguas Calientes (3h)',
            icon: 'fas fa-train',
            color: 'bg-light text-dark border'
          },
          {
            id: '4-2',
            type: 'sub-activity',
            title: 'Bus a Machu Picchu (30min)',
            icon: 'fas fa-bus',
            color: 'bg-light text-dark border'
          },
          {
            id: '4-3',
            type: 'sub-activity',
            title: 'Visita guiada (2h30min)',
            icon: 'fas fa-user-tie',
            color: 'bg-light text-dark border'
          }
        ]
      },
      {
        id: '5',
        type: 'end',
        title: 'Regreso a Lima',
        description: 'Vuelo de retorno',
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

  // Función para mover un elemento hacia arriba
  const handleItemMoveUp = (itemId: string) => {
    setItineraryData(prevData => {
      const currentIndex = prevData.items.findIndex(item => item.id === itemId);
      if (currentIndex > 0) {
        const newItems = [...prevData.items];
        [newItems[currentIndex - 1], newItems[currentIndex]] = [newItems[currentIndex], newItems[currentIndex - 1]];
        return { ...prevData, items: newItems };
      }
      return prevData;
    });
  };

  // Función para mover un elemento hacia abajo
  const handleItemMoveDown = (itemId: string) => {
    setItineraryData(prevData => {
      const currentIndex = prevData.items.findIndex(item => item.id === itemId);
      if (currentIndex < prevData.items.length - 1) {
        const newItems = [...prevData.items];
        [newItems[currentIndex], newItems[currentIndex + 1]] = [newItems[currentIndex + 1], newItems[currentIndex]];
        return { ...prevData, items: newItems };
      }
      return prevData;
    });
  };

  // Función para mover un sub-item hacia arriba
  const handleSubItemMoveUp = (itemId: string, subItemId: string) => {
    setItineraryData(prevData => ({
      ...prevData,
      items: prevData.items.map(item => {
        if (item.id === itemId && item.subItems) {
          const subIndex = item.subItems.findIndex(subItem => subItem.id === subItemId);
          if (subIndex > 0) {
            const newSubItems = [...item.subItems];
            [newSubItems[subIndex - 1], newSubItems[subIndex]] = [newSubItems[subIndex], newSubItems[subIndex - 1]];
            return { ...item, subItems: newSubItems };
          }
        }
        return item;
      })
    }));
  };

  // Función para mover un sub-item hacia abajo
  const handleSubItemMoveDown = (itemId: string, subItemId: string) => {
    setItineraryData(prevData => ({
      ...prevData,
      items: prevData.items.map(item => {
        if (item.id === itemId && item.subItems) {
          const subIndex = item.subItems.findIndex(subItem => subItem.id === subItemId);
          if (subIndex < item.subItems.length - 1) {
            const newSubItems = [...item.subItems];
            [newSubItems[subIndex], newSubItems[subIndex + 1]] = [newSubItems[subIndex + 1], newSubItems[subIndex]];
            return { ...item, subItems: newSubItems };
          }
        }
        return item;
      })
    }));
  };

  return (
    <div className="container mt-4">
      <h2>Ejemplo Avanzado - ItinerarySchedule con Control Completo</h2>
      
      <div className="alert alert-success">
        <h5>Funcionalidades Disponibles:</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>Elementos Principales:</h6>
            <ul className="mb-0">
              <li><strong>Mover:</strong> Botones ↑ ↓ (actividades y rutas)</li>
              <li><strong>Eliminar:</strong> Botón 🗑️ (actividades y rutas)</li>
              <li><strong>Protegidos:</strong> Inicio y fin (sin botones)</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Sub-elementos:</h6>
            <ul className="mb-0">
              <li><strong>Mover:</strong> Botones ↑ ↓ (todas las sub-actividades)</li>
              <li><strong>Eliminar:</strong> Botón ❌ (todas las sub-actividades)</li>
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
            onSubItemRemove={handleSubItemRemove}
            onItemMoveUp={handleItemMoveUp}
            onItemMoveDown={handleItemMoveDown}
            onSubItemMoveUp={handleSubItemMoveUp}
            onSubItemMoveDown={handleSubItemMoveDown}
          />
        </div>
      </div>
      
      <div className="mt-4">
        <h4>Modo Solo Lectura (sin botones)</h4>
        <ItinerarySchedule 
          data={itineraryData}
          editable={false}
        />
      </div>
    </div>
  );
};

export default ItineraryScheduleAdvancedExample;
