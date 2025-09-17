import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';

export interface ItineraryItem {
  id: string;
  type: 'start' | 'end' | 'activity' | 'route';
  title: string;
  subtitle?: string;
  description?: string;
  duration?: string;
  icon?: string;
  color?: string;
  subItems?: ItineraryItem[];
}

export interface ItineraryData {
  title: string;
  start: ItineraryItem;
  end: ItineraryItem;
  items: ItineraryItem[];
}

interface ItineraryScheduleProps {
  className?: string;
  data?: ItineraryData;
  editable?: boolean;
  onItemRemove?: (itemId: string) => void;
  onSubItemRemove?: (itemId: string, subItemId: string) => void;
  onItemMoveUp?: (itemId: string) => void;
  onItemMoveDown?: (itemId: string) => void;
  onSubItemMoveUp?: (itemId: string, subItemId: string) => void;
  onSubItemMoveDown?: (itemId: string, subItemId: string) => void;
  onAddSegment?: (afterItemId: string) => void;
}

// Configuración de tipos de elementos
const ITEM_TYPE_CONFIG = {
  start: {
    icon: 'fas fa-home',
    color: 'bg-warning text-white',
    size: '40px',
    fontSize: '14px'
  },
  end: {
    icon: 'fas fa-home',
    color: 'bg-warning text-white',
    size: '40px',
    fontSize: '14px'
  },
  activity: {
    icon: 'fas fa-suitcase-rolling',
    color: 'bg-primary text-white',
    size: '40px',
    fontSize: '14px'
  },
  route: {
    icon: 'fas fa-route',
    color: 'bg-white border border-dark text-dark',
    size: '40px',
    fontSize: '14px'
  }
};

const SUB_ITEM_CONFIG = {
  start: {
    icon: 'fas fa-home',
    color: 'bg-warning text-white',
    size: '20px',
    fontSize: '8px'
  },
  end: {
    icon: 'fas fa-home',
    color: 'bg-warning text-white',
    size: '20px',
    fontSize: '8px'
  },
  activity: {
    icon: 'fas fa-suitcase-rolling',
    color: 'bg-primary text-white',
    size: '20px',
    fontSize: '8px'
  },
  route: {
    icon: 'fas fa-route',
    color: 'bg-white border border-dark text-dark',
    size: '20px',
    fontSize: '8px'
  }
};

const ItinerarySchedule: React.FC<ItineraryScheduleProps> = ({ 
  className = '', 
  data, 
  editable = false,
  onItemRemove,
  onSubItemRemove,
  onItemMoveUp,
  onItemMoveDown,
  onSubItemMoveUp,
  onSubItemMoveDown,
  onAddSegment
}) => {
  const { language } = useLanguage();

  // Datos de ejemplo por defecto
  const defaultData: ItineraryData = {
    title: getTranslation('stepItinerary.example.title', language),
    start: {
      id: 'start',
      type: 'start',
      title: 'Lugar de salida:',
      description: 'Marina Turistica de Paracas'
    },
    end: {
      id: 'end',
      type: 'end',
      title: 'Regresa a:',
      description: 'Marina Turistica de Paracas'
    },
    items: [
      {
        id: '2',
        type: 'route',
        title: 'Deslizador / Transporte acuatico',
        duration: '15min'
      },
      {
        id: '3',
        type: 'activity',
        title: 'Candelabro de Paracas',
        subtitle: 'Parada para hacer fotos, Tour guiado, etc.',
        duration: '5min'
      },
      {
        id:'4',
        type: 'route',
        title: 'Deslizador / Transporte acuatico',
        duration: '15min'
      },
      {
        id: '5',
        type: 'activity',
        title: 'Islas ballestas',
        subtitle: 'Parada para hacer fotos, Tour guiado, etc.',
        duration: '30min'
      },
      {
        id:'6',
        type: 'route',
        title: 'Deslizador / Transporte acuatico',
        duration: '30min'
      }
    ]
  };

  // Estado local para manejar los datos cuando no hay callbacks
  const [localData, setLocalData] = useState<ItineraryData | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    itemId: string;
    x: number;
    y: number;
  } | null>(null);
  
  const itineraryData = data || localData || defaultData;

  const getItemIcon = (item: ItineraryItem, isSubItem: boolean = false) => {
    if (item.icon) {
      return <i className={item.icon}></i>;
    }
    
    const config = isSubItem ? SUB_ITEM_CONFIG[item.type] : ITEM_TYPE_CONFIG[item.type];
    return <i className={config?.icon || 'fas fa-circle'}></i>;
  };

  const getItemColor = (item: ItineraryItem, isSubItem: boolean = false) => {
    if (item.color) {
      return item.color;
    }
    
    const config = isSubItem ? SUB_ITEM_CONFIG[item.type] : ITEM_TYPE_CONFIG[item.type];
    return config?.color || 'bg-secondary text-white';
  };

  const getItemSize = (item: ItineraryItem, isSubItem: boolean = false) => {
    if (isSubItem) {
      const config = SUB_ITEM_CONFIG[item.type];
      return config?.size || '20px';
    }
    const config = ITEM_TYPE_CONFIG[item.type];
    return config?.size || '40px';
  };

  const getItemFontSize = (item: ItineraryItem, isSubItem: boolean = false) => {
    if (isSubItem) {
      const config = SUB_ITEM_CONFIG[item.type];
      return config?.fontSize || '8px';
    }
    const config = ITEM_TYPE_CONFIG[item.type];
    return config?.fontSize || '14px';
  };

  // Función para calcular la altura real de cualquier elemento considerando saltos de línea
  const calculateItemHeight = (item: ItineraryItem) => {
    let baseHeight = 24; // Altura base para título
    
    // Si tiene subtítulo, agregar altura adicional
    if (item.subtitle) {
      // Contar saltos de línea en el subtítulo
      const lineBreaks = (item.subtitle.match(/\n/g) || []).length;
      baseHeight += 16 + (lineBreaks * 16); // 16px por línea adicional
    }
    
    // Si tiene descripción, agregar altura adicional
    if (item.description) {
      const descLineBreaks = (item.description.match(/\n/g) || []).length;
      baseHeight += 16 + (descLineBreaks * 16); // 16px por línea adicional
    }
    
    // Si tiene duración, agregar altura adicional
    if (item.duration) {
      baseHeight += 4; // Espaciado adicional para duración
    }
    
    return Math.max(baseHeight, 32); // Mínimo 32px
  };

  // Función para calcular la altura real de una sub-actividad considerando saltos de línea
  const calculateSubItemHeight = (subItem: ItineraryItem) => {
    return calculateItemHeight(subItem);
  };

  const canRemoveItem = (item: ItineraryItem) => {
    // Los elementos start y end no se pueden eliminar
    return item.type !== 'start' && item.type !== 'end';
  };

  const canMoveItem = (item: ItineraryItem) => {
    // Los elementos start y end no se pueden mover
    return item.type !== 'start' && item.type !== 'end';
  };

  const canMoveItemUp = (item: ItineraryItem, index: number) => {
    // No se puede mover arriba si el elemento anterior es start
    if (index > 0 && itineraryData.items[index - 1].type === 'start') {
      return false;
    }
    return canMoveItem(item) && index > 0;
  };

  const canMoveItemDown = (item: ItineraryItem, index: number) => {
    // No se puede mover abajo si el elemento siguiente es end
    if (index < itineraryData.items.length - 1 && itineraryData.items[index + 1].type === 'end') {
      return false;
    }
    return canMoveItem(item) && index < itineraryData.items.length - 1;
  };

  const canMoveSubItemUp = (subItem: ItineraryItem, subIndex: number) => {
    return subIndex > 0;
  };

  const canMoveSubItemDown = (subItem: ItineraryItem, subIndex: number, totalSubItems: number) => {
    return subIndex < totalSubItems - 1;
  };

  const handleItemRemove = (itemId: string) => {
    if (onItemRemove) {
      onItemRemove(itemId);
    } else {
      // Si no hay callback, actualizar el estado local
      const updatedItems = itineraryData.items.filter(item => item.id !== itemId);
      setLocalData(prevData => ({
        ...prevData!,
        items: updatedItems
      }));
    }
  };

  const handleSubItemRemove = (itemId: string, subItemId: string) => {
    if (onSubItemRemove) {
      onSubItemRemove(itemId, subItemId);
    } else {
      // Si no hay callback, actualizar el estado local
      const updatedItems = itineraryData.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            subItems: item.subItems?.filter(subItem => subItem.id !== subItemId)
          };
        }
        return item;
      });
      setLocalData(prevData => ({
        ...prevData!,
        items: updatedItems
      }));
    }
  };

  const handleItemMoveUp = (itemId: string) => {
    if (onItemMoveUp) {
      onItemMoveUp(itemId);
    } else {
      // Si no hay callback, actualizar el estado local
      const currentIndex = itineraryData.items.findIndex(item => item.id === itemId);
      if (currentIndex > 0) {
        const newItems = [...itineraryData.items];
        [newItems[currentIndex - 1], newItems[currentIndex]] = [newItems[currentIndex], newItems[currentIndex - 1]];
        setLocalData(prevData => ({
          ...prevData!,
          items: newItems
        }));
      }
    }
  };

  const handleItemMoveDown = (itemId: string) => {
    if (onItemMoveDown) {
      onItemMoveDown(itemId);
    } else {
      // Si no hay callback, actualizar el estado local
      const currentIndex = itineraryData.items.findIndex(item => item.id === itemId);
      if (currentIndex < itineraryData.items.length - 1) {
        const newItems = [...itineraryData.items];
        [newItems[currentIndex], newItems[currentIndex + 1]] = [newItems[currentIndex + 1], newItems[currentIndex]];
        setLocalData(prevData => ({
          ...prevData!,
          items: newItems
        }));
      }
    }
  };

  const handleSubItemMoveUp = (itemId: string, subItemId: string) => {
    if (onSubItemMoveUp) {
      onSubItemMoveUp(itemId, subItemId);
    } else {
      // Si no hay callback, actualizar el estado local
      const updatedItems = itineraryData.items.map(item => {
        if (item.id === itemId && item.subItems) {
          const subIndex = item.subItems.findIndex(subItem => subItem.id === subItemId);
          if (subIndex > 0) {
            const newSubItems = [...item.subItems];
            [newSubItems[subIndex - 1], newSubItems[subIndex]] = [newSubItems[subIndex], newSubItems[subIndex - 1]];
            return { ...item, subItems: newSubItems };
          }
        }
        return item;
      });
      setLocalData(prevData => ({
        ...prevData!,
        items: updatedItems
      }));
    }
  };

  const handleSubItemMoveDown = (itemId: string, subItemId: string) => {
    if (onSubItemMoveDown) {
      onSubItemMoveDown(itemId, subItemId);
    } else {
      // Si no hay callback, actualizar el estado local
      const updatedItems = itineraryData.items.map(item => {
        if (item.id === itemId && item.subItems) {
          const subIndex = item.subItems.findIndex(subItem => subItem.id === subItemId);
          if (subIndex < item.subItems.length - 1) {
            const newSubItems = [...item.subItems];
            [newSubItems[subIndex], newSubItems[subIndex + 1]] = [newSubItems[subIndex + 1], newSubItems[subIndex]];
            return { ...item, subItems: newSubItems };
          }
        }
        return item;
      });
      setLocalData(prevData => ({
        ...prevData!,
        items: updatedItems
      }));
    }
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({
      itemId,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleAddSegment = (itemId: string) => {
    if (onAddSegment) {
      onAddSegment(itemId);
    }
    setContextMenu(null);
  };

  const handleRemoveSegment = (itemId: string) => {
    handleItemRemove(itemId);
    setContextMenu(null);
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <div className={className}>
      
      
      {/* Timeline */}
      <div className="position-relative">
        {/* Timeline items */}
        <div className="ms-5">
          {/* Start item */}
          {(() => {
            const item = itineraryData.start;
            const index = -1; // Start siempre es el primer elemento
            const hasSubItems = false; // Start nunca tiene sub-items
            const subItemsHeight = 0;
            const itemContentHeight = calculateItemHeight(item); // Altura del contenido considerando saltos de línea
            const totalItemHeight = itemContentHeight + subItemsHeight;
            
            return (
              <div key={item.id} className="position-relative">
                {/* Contenedor principal del elemento */}
                <div className="d-flex align-items-start mb-3">
                  <div 
                    className={`${getItemColor(item, false)} rounded-circle d-flex align-items-center justify-content-center me-3`}
                    style={{ 
                      width: getItemSize(item, false), 
                      height: getItemSize(item, false), 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      zIndex: 2, 
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    {getItemIcon(item, false)}
                  </div>
                  
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold text-black">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-muted small">
                            {item.subtitle}
                            {item.type === 'activity' && item.duration && (
                              <span> - {item.duration}</span>
                            )}
                          </div>
                        )}
                        {item.description && (
                          <div className="text-muted small">{item.description}</div>
                        )}
                        {item.duration && item.type !== 'start' && item.type !== 'end' && item.type !== 'activity' && (
                          <span className="text-muted small">({item.duration})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Línea de conexión al siguiente elemento */}
                {itineraryData.items.length > 0 && (() => {
                  const nextItem = itineraryData.items[0];
                  const nextItemHasSubItems = nextItem.subItems && nextItem.subItems.length > 0;
                  const nextItemSubItemsHeight = nextItemHasSubItems ? 
                    nextItem.subItems!.reduce((total, subItem) => total + calculateSubItemHeight(subItem), 0) + 16 : 0;
                  const nextItemHeight = 48 + nextItemSubItemsHeight;
                  
                  // Calcular la distancia exacta entre el centro del Start y el centro del primer item
                  const startCenterY = 20; // Centro del círculo del Start (40px / 2)
                  const nextItemCenterY = 20 + 20 + (nextItemHeight / 2); // Margen + centro del siguiente
                  const lineHeight = nextItemCenterY - startCenterY;
                  
                  return (
                    <div 
                      className="position-absolute" 
                      style={{ 
                        left: '20px', 
                        top: `${startCenterY}px`,
                        width: '2px', 
                        height: `${lineHeight}px`,
                        backgroundColor: '#ff6b35', 
                        zIndex: 1 
                      }}
                    ></div>
                  );
                })()}
              </div>
            );
          })()}
          
          {/* Middle items */}
          {itineraryData.items.map((item, index) => {
            // Calcular la altura total del elemento incluyendo sub-items
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const itemContentHeight = calculateItemHeight(item); // Altura del contenido principal considerando saltos de línea
            const subItemsHeight = hasSubItems ? 
              item.subItems!.reduce((total, subItem) => total + calculateSubItemHeight(subItem), 0) + 16 : 0; // Altura real de sub-items + 16px de margen
            const totalItemHeight = itemContentHeight + subItemsHeight; // Altura del contenido + altura de sub-items
            
            return (
              <div key={item.id} className="position-relative">
                {/* Contenedor principal del elemento */}
                <div className="d-flex align-items-start mb-3">
                  <div 
                    className={`${getItemColor(item, false)} rounded-circle d-flex align-items-center justify-content-center me-3`}
                    style={{ 
                      width: getItemSize(item, false), 
                      height: getItemSize(item, false), 
                      fontSize: getItemFontSize(item, false), 
                      fontWeight: 'bold', 
                      zIndex: 2, 
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    {getItemIcon(item, false)}
                  </div>
                  
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold text-bold">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-muted small">
                          {item.subtitle}
                          {item.duration && (
                            <span> - {item.duration}</span>
                          )}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-muted small">{item.description}</div>
                      )}
                      {item.duration && item.type !== 'start' && item.type !== 'end' && item.type !== 'activity' && (
                        <span className="text-muted small">({item.duration})</span>
                      )}
                    </div>
                      
                      {/* Botones de control del elemento principal - Solo para actividades y rutas */}
                      {editable && item.type !== 'start' && item.type !== 'end' && (
                        <div className="d-flex gap-1">
                          {/* Botones de movimiento */}
                          {canMoveItem(item) && (
                            <>
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handleItemMoveUp(item.id)}
                                disabled={!canMoveItemUp(item, index)}
                                title="Mover arriba"
                              >
                                <i className="fas fa-arrow-up"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handleItemMoveDown(item.id)}
                                disabled={!canMoveItemDown(item, index)}
                                title="Mover abajo"
                              >
                                <i className="fas fa-arrow-down"></i>
                              </button>
                            </>
                          )}
                          
                          {/* Menú contextual */}
                          <div className="dropdown">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={(e) => handleContextMenu(e, item.id)}
                              title="Opciones"
                            >
                              <i className="fas fa-ellipsis-h"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Sub-items */}
                    {hasSubItems && (
                      <div className="ms-4 mt-2 position-relative">
                        {item.subItems!.map((subItem, subIndex) => {
                          const isLastSubItem = subIndex === item.subItems!.length - 1;
                          const subItemHeight = calculateItemHeight(subItem);
                          
                          return (
                            <div key={subItem.id} className="position-relative">
                              {/* Contenedor principal del sub-item */}
                              <div className="d-flex align-items-start mb-2">
                                <div 
                                  className={`${getItemColor(subItem, true)} rounded-circle d-flex align-items-center justify-content-center me-2`}
                                  style={{ 
                                    width: getItemSize(subItem, true), 
                                    height: getItemSize(subItem, true), 
                                    fontSize: getItemFontSize(subItem, true),
                                    fontWeight: 'bold',
                                    zIndex: 2, 
                                    position: 'relative',
                                    flexShrink: 0
                                  }}
                                >
                                  {getItemIcon(subItem, true)}
                                </div>
                                
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <div className="fw-bold text-black small">
                                        {subItem.title}
                                      </div>
                                      {subItem.subtitle && (
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                          {subItem.subtitle}
                                          {subItem.duration && (
                                            <span> - {subItem.duration}</span>
                                          )}
                                        </div>
                                      )}
                                      {subItem.description && (
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{subItem.description}</div>
                                      )}
                                      {subItem.duration && !subItem.subtitle && (
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>({subItem.duration})</span>
                                      )}
                                    </div>
                                    
                                    {/* Botones de control del sub-item */}
                                    {editable && (
                                      <div className="d-flex gap-1">
                                        {/* Botones de movimiento */}
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary btn-sm"
                                          onClick={() => handleSubItemMoveUp(item.id, subItem.id)}
                                          disabled={!canMoveSubItemUp(subItem, subIndex)}
                                          title="Mover arriba"
                                          style={{ fontSize: '10px', padding: '2px 6px' }}
                                        >
                                          <i className="fas fa-arrow-up"></i>
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary btn-sm"
                                          onClick={() => handleSubItemMoveDown(item.id, subItem.id)}
                                          disabled={!canMoveSubItemDown(subItem, subIndex, item.subItems!.length)}
                                          title="Mover abajo"
                                          style={{ fontSize: '10px', padding: '2px 6px' }}
                                        >
                                          <i className="fas fa-arrow-down"></i>
                                        </button>
                                        
                                        {/* Botón de eliminar */}
                                        <button
                                          type="button"
                                          className="btn btn-outline-danger btn-sm"
                                          onClick={() => handleSubItemRemove(item.id, subItem.id)}
                                          title="Eliminar sub-elemento"
                                          style={{ fontSize: '10px', padding: '2px 6px' }}
                                        >
                                          <i className="fas fa-times"></i>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Línea de conexión al siguiente sub-item */}
                              {!isLastSubItem && (
                                <div 
                                  className="position-absolute" 
                                  style={{ 
                                    left: '10px', 
                                    top: '10px',
                                    width: '2px', 
                                    height: `${subItemHeight + 8}px`,
                                    backgroundColor: '#ff6b35', 
                                    zIndex: 1 
                                  }}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Línea de conexión al siguiente elemento */}
                {(index < itineraryData.items.length - 1 || (index === itineraryData.items.length - 1 && itineraryData.end)) && (() => {
                  // Calcular la altura necesaria para llegar al centro del siguiente elemento
                  const nextItem = index < itineraryData.items.length - 1 
                    ? itineraryData.items[index + 1] 
                    : itineraryData.end;
                  const nextItemHasSubItems = nextItem.subItems && nextItem.subItems.length > 0;
                  const nextItemSubItemsHeight = nextItemHasSubItems ? 
                    nextItem.subItems!.reduce((total, subItem) => total + calculateSubItemHeight(subItem), 0) + 16 : 0;
                  const nextItemHeight = 48 + nextItemSubItemsHeight;
                  
                  // Calcular la distancia exacta entre centros
                  const currentItemCenterY = 20; // Centro del círculo actual (40px / 2)
                  const currentItemBottom = totalItemHeight; // Fondo del elemento actual
                  const marginBetween = 20; // Margen entre elementos
                  const nextItemCenterY = 20; // Centro del círculo del siguiente elemento
                  
                  // La línea va desde el centro del elemento actual hasta el centro del siguiente
                  const lineStartY = currentItemCenterY;
                  const lineEndY = currentItemBottom + marginBetween + nextItemCenterY;
                  const lineHeight = lineEndY - lineStartY;
                  
                  return (
                    <div 
                      className="position-absolute" 
                      style={{ 
                        left: '20px', 
                        top: `${lineStartY}px`,
                        width: '2px', 
                        height: `${lineHeight}px`,
                        backgroundColor: '#ff6b35', 
                        zIndex: 1 
                      }}
                    ></div>
                  );
                })()}
              </div>
            );
          })}
          
          {/* End item */}
          {itineraryData.end && (() => {
            const item = itineraryData.end;
            const index = itineraryData.items.length; // End siempre es el último elemento
            const hasSubItems = false; // End nunca tiene sub-items
            const subItemsHeight = 0;
            const itemContentHeight = calculateItemHeight(item); // Altura del contenido considerando saltos de línea
            const totalItemHeight = itemContentHeight + subItemsHeight;
            
            return (
              <div key={item.id} className="position-relative">
                {/* Contenedor principal del elemento */}
                <div className="d-flex align-items-start mb-3">
                  <div 
                    className={`${getItemColor(item, false)} rounded-circle d-flex align-items-center justify-content-center me-3`}
                    style={{ 
                      width: getItemSize(item, false), 
                      height: getItemSize(item, false), 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      zIndex: 2, 
                      position: 'relative',
                      flexShrink: 0
                    }}>
                    {getItemIcon(item, false)}
                  </div>
                  
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold text-black">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-muted small">
                            {item.subtitle}
                            {item.type === 'activity' && item.duration && (
                              <span> - {item.duration}</span>
                            )}
                          </div>
                        )}
                        {item.description && (
                          <div className="text-muted small">{item.description}</div>
                        )}
                        {item.duration && item.type !== 'start' && item.type !== 'end' && item.type !== 'activity' && (
                          <span className="text-muted small">({item.duration})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Botón para agregar segmento entre Start y End */}
      {editable && (() => {
        // Encontrar los segmentos (solo actividades y rutas)
        const segments = itineraryData.items.filter(item => 
          item.type === 'activity' || item.type === 'route'
        );
        
        if (segments.length > 0) {
          // Si hay segmentos, mostrar el botón después del último segmento
          const lastSegment = segments[segments.length - 1];
          return (
            <div className="d-flex justify-content-start my-3">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleAddSegment(lastSegment.id)}
                title="Agregar nuevo segmento"
              >
                <i className="fas fa-plus me-2"></i>
                Agregar nuevo segmento
              </button>
            </div>
          );
        } else {
          // Si no hay segmentos, mostrar el botón después del Start
          return (
            <div className="d-flex justify-content-start">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleAddSegment('start')}
                title="Agregar nuevo segmento"
              >
                <i className="fas fa-plus me-2"></i>
                Agregar nuevo segmento
              </button>
            </div>
          );
        }
      })()}

      {/* Menú contextual */}
      {contextMenu && (
        <div
          className="position-fixed bg-white border shadow-lg rounded"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
            minWidth: '150px'
          }}
        >
          <div className="p-2">
            <button
              className="btn btn-link btn-sm w-100 text-start d-flex align-items-center"
              onClick={() => handleAddSegment(contextMenu.itemId)}
            >
              <i className="fas fa-plus me-2"></i>
              Agregar Segmento
            </button>
            {canRemoveItem(itineraryData.items.find(item => item.id === contextMenu.itemId)!) && (
              <button
                className="btn btn-link btn-sm w-100 text-start d-flex align-items-center text-danger"
                onClick={() => handleRemoveSegment(contextMenu.itemId)}
              >
                <i className="fas fa-trash me-2"></i>
                Eliminar Segmento
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar el menú contextual */}
      {contextMenu && (
        <div
          className="position-fixed"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={closeContextMenu}
        />
      )}
    </div>
  );
};

export default ItinerarySchedule;
