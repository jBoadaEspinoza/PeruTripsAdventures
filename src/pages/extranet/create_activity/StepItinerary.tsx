import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation, getTranslationWithParams } from '../../../utils/translations';
import ActivityCreationLayout from '../../../components/ActivityCreationLayout';
import ActivityTypeModal from '../../../components/ActivityTypeModal';
import LocationSelectionModal from '../../../components/LocationSelectionModal';
import DurationModal from '../../../components/DurationModal';
import VehicleTypeModal from '../../../components/VehicleTypeModal';
import { useAppSelector, useAppDispatch } from '../../../redux/store';
import { setCurrentStep, addItineraryDay, updateItineraryDay, removeItineraryDay, addItineraryItem } from '../../../redux/activityCreationSlice';

const StepItinerary: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const dispatch = useAppDispatch();
  const { activityId, selectedCategory, itinerary } = useAppSelector(state => state.activityCreation);
  const [showItineraryCreator, setShowItineraryCreator] = useState(false);
  
  // Modal states
  const [showActivityTypeModal, setShowActivityTypeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);
  
  // Current item being created
  const [currentDayId, setCurrentDayId] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<{
    type: 'activity' | 'transfer';
    title: string;
    description?: string;
    location?: string;
    duration?: { hours: number; minutes: number };
    vehicleType?: string;
    activityType?: string;
  }>({
    type: 'activity',
    title: '',
    description: '',
    location: '',
    duration: { hours: 0, minutes: 0 },
    vehicleType: '',
    activityType: ''
  });

  useEffect(() => {
    dispatch(setCurrentStep(10)); // StepItinerary is step 10
  }, [dispatch]);

  useEffect(() => {
    if (!activityId) {
      console.log('StepItinerary: No se encontró activityId, redirigiendo a createCategory');
      navigate('/extranet/activity/createCategory');
    }
  }, [activityId, navigate]);

  const handleBack = () => {
    navigate('/extranet/activity/createOptions');
  };

  const handleContinue = () => {
    navigate('/extranet/activity/review');
  };

  const handleCreateItinerary = () => {
    setShowItineraryCreator(true);
  };

  const handleAddDay = () => {
    const newDay = {
      id: Date.now().toString(),
      dayNumber: itinerary.length + 1,
      title: '',
      description: '',
      items: []
    };
    dispatch(addItineraryDay(newDay));
  };

  const handleUpdateDay = (id: string, field: 'title' | 'description', value: string) => {
    dispatch(updateItineraryDay({ id, updates: { [field]: value } }));
  };

  const handleRemoveDay = (id: string) => {
    dispatch(removeItineraryDay(id));
  };

  // Modal handlers
  const handleAddActivity = (dayId: string) => {
    setCurrentDayId(dayId);
    setCurrentItem({
      type: 'activity',
      title: '',
      description: '',
      location: '',
      duration: { hours: 0, minutes: 0 },
      vehicleType: '',
      activityType: ''
    });
    setShowActivityTypeModal(true);
  };

  const handleAddTransfer = (dayId: string) => {
    setCurrentDayId(dayId);
    setCurrentItem({
      type: 'transfer',
      title: '',
      description: '',
      location: '',
      duration: { hours: 0, minutes: 0 },
      vehicleType: '',
      activityType: ''
    });
    setShowVehicleTypeModal(true);
  };

  const handleActivityTypeSelected = (activityType: string) => {
    setCurrentItem(prev => ({ ...prev, activityType, title: activityType }));
    setShowActivityTypeModal(false);
    setShowLocationModal(true);
  };

  const handleLocationSelected = (location: string) => {
    setCurrentItem(prev => ({ ...prev, location }));
    setShowLocationModal(false);
    setShowDurationModal(true);
  };

  const handleDurationSet = (duration: { hours: number; minutes: number }) => {
    setCurrentItem(prev => ({ ...prev, duration }));
    setShowDurationModal(false);
    
    // Create the itinerary item
    const newItem = {
      id: Date.now().toString(),
      ...currentItem,
      duration
    };
    
    dispatch(addItineraryItem({ dayId: currentDayId, item: newItem }));
    
    // Reset state
    setCurrentDayId('');
    setCurrentItem({
      type: 'activity',
      title: '',
      description: '',
      location: '',
      duration: { hours: 0, minutes: 0 },
      vehicleType: '',
      activityType: ''
    });
  };

  const handleVehicleTypeSelected = (vehicleType: string) => {
    setCurrentItem(prev => ({ ...prev, vehicleType, title: vehicleType }));
    setShowVehicleTypeModal(false);
    setShowDurationModal(true);
  };

  const handleSkipDuration = () => {
    setShowDurationModal(false);
    
    // Create the itinerary item without duration
    const newItem = {
      id: Date.now().toString(),
      ...currentItem
    };
    
    dispatch(addItineraryItem({ dayId: currentDayId, item: newItem }));
    
    // Reset state
    setCurrentDayId('');
    setCurrentItem({
      type: 'activity',
      title: '',
      description: '',
      location: '',
      duration: { hours: 0, minutes: 0 },
      vehicleType: '',
      activityType: ''
    });
  };

  const handleCloseModal = () => {
    setShowActivityTypeModal(false);
    setShowLocationModal(false);
    setShowDurationModal(false);
    setShowVehicleTypeModal(false);
    setCurrentDayId('');
    setCurrentItem({
      type: 'activity',
      title: '',
      description: '',
      location: '',
      duration: { hours: 0, minutes: 0 },
      vehicleType: '',
      activityType: ''
    });
  };

  // Helper function to get icon for activity type
  const getActivityIcon = (activityType: string, type: 'activity' | 'transfer') => {
    if (type === 'transfer') {
      return <i className="fas fa-route"></i>;
    }
    
    // Activity type icons - using star/compass icon like in the image
    return <i className="fas fa-star"></i>;
  };

  // Helper function to get icon color class
  const getIconColorClass = (activityType: string, type: 'activity' | 'transfer') => {
    if (type === 'transfer') {
      return 'bg-light text-secondary border';
    }
    
    // Activity type colors - using dark blue like in the image
    return 'bg-primary text-white';
  };

  return (
    <ActivityCreationLayout totalSteps={10}>
      <div className="container-fluid">
        {/* Contenido principal */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {/* Título y descripción */}
                <div className="d-flex align-items-center mb-4">
                  <h5 className="mb-0 me-3">
                    {getTranslation('stepItinerary.title', language)}
                  </h5>
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '24px', height: '24px' }}>
                    <i className="fas fa-question" style={{ fontSize: '12px' }}></i>
                  </div>
                </div>

                <p className="text-muted mb-4">
                  {getTranslation('stepItinerary.description', language)}
                </p>

                {!showItineraryCreator ? (
                  /* Welcome Screen */
                  <div className="row">
                    {/* Left side - Itinerary Summary or Example */}
                    <div className="col-md-6">
                      <div className="border rounded p-4 h-100">
                        {itinerary.some(day => day.items && day.items.length > 0) ? (
                          /* Real Itinerary Summary */
                          <div>
                            <h6 className="text-primary mb-3">
                              <i className="fas fa-route me-2"></i>
                              {getTranslation('stepItinerary.itinerarySummary', language)}
                            </h6>
                            
                            <div className="position-relative">
                              {/* Main timeline line - red dotted line */}
                              <div 
                                className="position-absolute" 
                                style={{ 
                                  left: '20px', 
                                  top: '0', 
                                  bottom: '0', 
                                  width: '3px', 
                                  background: 'repeating-linear-gradient(to bottom, #dc3545 0px, #dc3545 8px, transparent 8px, transparent 16px)'
                                }}
                              ></div>
                              
                              {/* Timeline items for all days */}
                              <div className="ms-5">
                                {itinerary.map((day, dayIndex) => (
                                  day.items && day.items.length > 0 && (
                                    <div key={day.id} className="mb-4">
                                      {/* Day header */}
                                      <div className="d-flex align-items-center mb-2">
                                        <div 
                                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold"
                                          style={{ width: '30px', height: '30px', fontSize: '12px' }}
                                        >
                                          {day.dayNumber}
                                        </div>
                                        <h6 className="mb-0 text-primary">
                                          {day.title || `Día ${day.dayNumber}`}
                                        </h6>
                                      </div>
                                      
                                      {/* Day items */}
                                      <div className="ms-4">
                                        {day.items.map((item, itemIndex) => (
                                          <div key={item.id} className="d-flex align-items-start mb-2">
                                            <div 
                                              className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${getIconColorClass(item.activityType || '', item.type)}`}
                                              style={{ width: '30px', height: '30px', fontSize: '12px', flexShrink: 0 }}
                                            >
                                              {getActivityIcon(item.activityType || '', item.type)}
                                            </div>
                                            <div className="flex-grow-1">
                                              <div className={`${item.type === 'activity' ? 'fw-bold' : ''} text-primary small`}>
                                                {item.title}
                                              </div>
                                              {item.location && (
                                                <div className="text-primary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                                                  {item.location}
                                                </div>
                                              )}
                                              {item.duration && (item.duration.hours > 0 || item.duration.minutes > 0) && (
                                                <div className="text-primary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                                                  ({item.duration.hours}h {item.duration.minutes}m)
                                                </div>
                                              )}
                                              {item.vehicleType && (
                                                <div className="text-primary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                                                  ({item.vehicleType})
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Example Itinerary */
                          <div>
                            <h6 className="text-primary mb-3">
                              {getTranslation('stepItinerary.example.title', language)}
                            </h6>
                            
                            {/* Timeline Example */}
                            <div className="position-relative">
                              {/* Timeline line */}
                              <div className="position-absolute" style={{ left: '20px', top: '0', bottom: '0', width: '2px', backgroundColor: '#ff6b35' }}></div>
                              
                              {/* Timeline items */}
                              <div className="ms-5">
                                {/* Item 1 */}
                                <div className="d-flex align-items-center mb-3">
                                  <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                       style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                                    G
                                  </div>
                                  <div>
                                    <div className="fw-bold">Lugar de recogida: Edinburgh</div>
                                    <div className="text-muted small">Bus ride (1h30min)</div>
                                  </div>
                                </div>
                                
                                {/* Item 2 */}
                                <div className="d-flex align-items-center mb-3">
                                  <div className="bg-white border border-dark rounded-circle d-flex align-items-center justify-content-center me-3" 
                                       style={{ width: '40px', height: '40px' }}>
                                    <i className="fas fa-route text-dark"></i>
                                  </div>
                                  <div>
                                    <div className="fw-bold">Glencoe (Photo stop)</div>
                                  </div>
                                </div>
                                
                                {/* Item 3 */}
                                <div className="d-flex align-items-center mb-3">
                                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                       style={{ width: '40px', height: '40px' }}>
                                    <i className="fas fa-star"></i>
                                  </div>
                                  <div>
                                    <div className="fw-bold">Loch Ness (Free time (3h))</div>
                                    <div className="ms-4 mt-1">
                                      <div className="d-flex align-items-center">
                                        <div className="bg-white border border-dark rounded-circle d-flex align-items-center justify-content-center me-2" 
                                             style={{ width: '20px', height: '20px' }}>
                                        </div>
                                        <div className="text-muted small">Urquhart Castle (Guided visit (3h), Optional, Extra fee)</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Item 4 */}
                                <div className="d-flex align-items-center mb-3">
                                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                       style={{ width: '40px', height: '40px' }}>
                                    <i className="fas fa-star"></i>
                                  </div>
                                  <div>
                                    <div className="fw-bold">Pitlochry (Free time (3h))</div>
                                  </div>
                                </div>
                                
                                {/* Item 5 */}
                                <div className="d-flex align-items-center">
                                  <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                       style={{ width: '40px', height: '40px' }}>
                                    <i className="fas fa-home"></i>
                                  </div>
                                  <div>
                                    <div className="fw-bold">Regresa a: Edinburgh</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - Action Button */}
                    <div className="col-md-6">
                      <div className="h-100 d-flex flex-column justify-content-center">
                        <div className="d-flex justify-content-end">
                          <button
                            type="button"
                            className="btn btn-primary btn-lg"
                            onClick={handleCreateItinerary}
                          >
                            {getTranslation('stepItinerary.continueCreating', language)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Itinerary Creator */
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h6 className="mb-0">Crear tu itinerario</h6>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setShowItineraryCreator(false)}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Volver
                      </button>
                    </div>
                    
                    {itinerary.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
                        <h5 className="text-muted mb-3">
                          {getTranslation('stepItinerary.noDays', language)}
                        </h5>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleAddDay}
                        >
                          <i className="fas fa-plus me-2"></i>
                          {getTranslation('stepItinerary.addDay', language)}
                        </button>
                      </div>
                    ) : (
                      <div>
                        {itinerary.map((day, index) => (
                          <div key={day.id} className="card mb-3">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">
                                  {getTranslationWithParams('stepItinerary.day.title', language, { dayNumber: day.dayNumber })}
                                </h6>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRemoveDay(day.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                              
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Título del día</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder={getTranslation('stepItinerary.day.titlePlaceholder', language)}
                                    value={day.title}
                                    onChange={(e) => handleUpdateDay(day.id, 'title', e.target.value)}
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Descripción</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder={getTranslation('stepItinerary.day.descriptionPlaceholder', language)}
                                    value={day.description}
                                    onChange={(e) => handleUpdateDay(day.id, 'description', e.target.value)}
                                  />
                                </div>
                              </div>

                              {/* Visual Timeline */}
                              {day.items && day.items.length > 0 && (
                                <div className="mt-3">
                                  <h6 className="mb-3">{getTranslation('stepItinerary.visualTimeline', language)}:</h6>
                                  <div className="position-relative">
                                    {/* Timeline line - red dotted line like in the image */}
                                    <div 
                                      className="position-absolute" 
                                      style={{ 
                                        left: '20px', 
                                        top: '0', 
                                        bottom: '0', 
                                        width: '2px', 
                                        background: 'repeating-linear-gradient(to bottom, #dc3545 0px, #dc3545 8px, transparent 8px, transparent 16px)'
                                      }}
                                    ></div>
                                    
                                    {/* Timeline items */}
                                    <div className="ms-5">
                                      {day.items.map((item, itemIndex) => (
                                        <div key={item.id} className="d-flex align-items-start mb-3">
                                          {/* Icon based on type and activity */}
                                          <div 
                                            className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${getIconColorClass(item.activityType || '', item.type)}`}
                                            style={{ width: '40px', height: '40px', flexShrink: 0 }}
                                          >
                                            {getActivityIcon(item.activityType || '', item.type)}
                                          </div>
                                          
                                          {/* Item details */}
                                          <div className="flex-grow-1">
                                            <div className={`${item.type === 'activity' ? 'fw-bold' : ''} text-primary`}>
                                              {item.title}
                                            </div>
                                            {item.location && (
                                              <div className="text-primary small ms-2">
                                                {item.location}
                                              </div>
                                            )}
                                            {item.duration && (item.duration.hours > 0 || item.duration.minutes > 0) && (
                                              <div className="text-primary small ms-2">
                                                ({item.duration.hours}h {item.duration.minutes}m)
                                              </div>
                                            )}
                                            {item.vehicleType && (
                                              <div className="text-primary small ms-2">
                                                ({item.vehicleType})
                                              </div>
                                            )}
                                          </div>
                                          
                                          {/* Menu icon on the right */}
                                          <div className="ms-2">
                                            <button 
                                              type="button" 
                                              className="btn btn-outline-primary btn-sm rounded-circle"
                                              style={{ width: '30px', height: '30px' }}
                                            >
                                              <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Add Activity/Transfer Buttons */}
                              <div className="mt-3 d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleAddActivity(day.id)}
                                >
                                  <i className="fas fa-plus me-1"></i>
                                  {getTranslation('stepItinerary.addActivity', language)}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-warning btn-sm"
                                  onClick={() => handleAddTransfer(day.id)}
                                >
                                  <i className="fas fa-plus me-1"></i>
                                  {getTranslation('stepItinerary.addTransfer', language)}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleAddDay}
                          >
                            <i className="fas fa-plus me-2"></i>
                            {getTranslation('stepItinerary.addDay', language)}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de navegación - Solo mostrar si no estamos en el creador de itinerarios */}
        {!showItineraryCreator && (
          <div className="row mt-4">
            <div className="col-12 d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
              >
                <i className="fas fa-arrow-left me-2"></i>
                {getTranslation('common.back', language)}
              </button>  
              <button
                type="button"
                className="btn btn-primary ms-2"
                onClick={handleContinue}
              >
                {getTranslation('common.continue', language)}
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ActivityTypeModal
        isOpen={showActivityTypeModal}
        onClose={handleCloseModal}
        onNext={handleActivityTypeSelected}
      />
      
      <LocationSelectionModal
        isOpen={showLocationModal}
        onClose={handleCloseModal}
        onNext={handleLocationSelected}
      />
      
      <DurationModal
        isOpen={showDurationModal}
        onClose={handleCloseModal}
        onNext={handleDurationSet}
        onSkip={handleSkipDuration}
      />
      
      <VehicleTypeModal
        isOpen={showVehicleTypeModal}
        onClose={handleCloseModal}
        onNext={handleVehicleTypeSelected}
      />
    </ActivityCreationLayout>
  );
};

export default StepItinerary;
