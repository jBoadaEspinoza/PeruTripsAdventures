import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import OptionSetupLayout from '../../../components/OptionSetupLayout';
import { useAppSelector } from '../../../redux/store';

interface ScheduleData {
  scheduleName: string;
  startDate: string;
  hasEndDate: boolean;
  endDate: string;
  weeklySchedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  timeSlots: {
    [key: string]: Array<{
      id: string;
      hour: string;
      minute: string;
    }>;
  };
  exceptions: Array<{
    date: string;
    description: string;
  }>;
}

export default function StepOptionAvailabilityPricingDepartureTime() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activityId } = useAppSelector(state => state.activityCreation);
  
  // Get current step from URL params, default to step 1 (Horario)
  const currentStep = parseInt(searchParams.get('step') || '1');
  
  const [formData, setFormData] = useState<ScheduleData>({
    scheduleName: '',
    startDate: '',
    hasEndDate: false,
    endDate: '',
    weeklySchedule: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    timeSlots: {},
    exceptions: []
  });

  const optionId = searchParams.get('optionId');
  const lang = searchParams.get('lang');
  const currency = searchParams.get('currency');
  const storageKey = `schedule_${optionId || 'default'}`;

  // Cargar datos guardados al inicializar
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        console.log('StepOptionAvailabilityPricingDepartureTime: Datos cargados desde localStorage:', parsedData);
      } catch (error) {
        console.error('StepOptionAvailabilityPricingDepartureTime: Error al cargar datos desde localStorage:', error);
      }
    }
  }, [storageKey]);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
      console.log('StepOptionAvailabilityPricingDepartureTime: Datos guardados en localStorage:', formData);
    }
  }, [formData, storageKey]);

  const handleSaveAndContinue = () => {
    console.log('StepOptionAvailabilityPricingDepartureTime: Guardando y continuando con datos:', formData);
    
    // Navigate to next step based on current step
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      navigate(`/extranet/activity/availabilityPricing?step=${nextStep}&optionId=${optionId}&lang=${lang}&currency=${currency}`);
    } else {
      // If we're at the last step, go back to the main availability pricing page
      navigate('/extranet/activity/availabilityPricing');
    }
  };

  const handleBack = () => {
    console.log('StepOptionAvailabilityPricingDepartureTime: Datos mantenidos en localStorage al regresar');
    
    // Navigate to previous step based on current step
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      navigate(`/extranet/activity/availabilityPricing?step=${prevStep}&optionId=${optionId}&lang=${lang}&currency=${currency}`);
    } else {
      // If we're at the first step, go back to the main availability pricing page
      navigate('/extranet/activity/availabilityPricing');
    }
  };

  const handleAddException = () => {
    setFormData(prev => ({
      ...prev,
      exceptions: [...prev.exceptions, { date: '', description: '' }]
    }));
  };

  const handleRemoveException = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exceptions: prev.exceptions.filter((_, i) => i !== index)
    }));
  };

  const handleExceptionChange = (index: number, field: 'date' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      exceptions: prev.exceptions.map((exception, i) => 
        i === index ? { ...exception, [field]: value } : exception
      )
    }));
  };

  // Time slot management functions
  const handleAddTimeSlot = (day: string) => {
    const newTimeSlot = {
      id: Date.now().toString(),
      hour: '08',
      minute: '00'
    };
    
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [day]: [...(prev.timeSlots[day] || []), newTimeSlot]
      }
    }));
  };

  const handleRemoveTimeSlot = (day: string, timeSlotId: string) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [day]: (prev.timeSlots[day] || []).filter(slot => slot.id !== timeSlotId)
      }
    }));
  };

  const handleTimeSlotChange = (day: string, timeSlotId: string, field: 'hour' | 'minute', value: string) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [day]: (prev.timeSlots[day] || []).map(slot => 
          slot.id === timeSlotId ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  if (!optionId) {
    return (
      <OptionSetupLayout currentSection="availabilityPricing">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted">Cargando configuración del horario...</p>
              </div>
            </div>
          </div>
        </div>
      </OptionSetupLayout>
    );
  }

  if (!activityId) {
    return (
      <OptionSetupLayout currentSection="availabilityPricing">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="text-center py-5">
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <h6 className="alert-heading">Actividad no encontrada</h6>
                  <p className="mb-0">
                    {language === 'es' 
                      ? 'No se encontró información de la actividad. Por favor, regresa al paso anterior para continuar.'
                      : 'Activity information not found. Please go back to the previous step to continue.'
                    }
                  </p>
                  <hr />
                  <button 
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => navigate('/extranet/activity/createCategory')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    {language === 'es' ? 'Ir a Categoría' : 'Go to Category'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </OptionSetupLayout>
    );
  }

  return (
    <OptionSetupLayout currentSection="availabilityPricing">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {/* Step Navigation */}
                 <div className="mb-5">
                   <div className="d-flex align-items-center justify-content-between">
                     {/* Step 1: Horario */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 1 ? 'bg-primary text-white' : currentStep > 1 ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         {currentStep > 1 ? (
                           <i className="fas fa-check"></i>
                         ) : (
                           <span className="fw-bold">1</span>
                         )}
                       </div>
                       <div>
                         <span className={currentStep === 1 ? 'fw-bold text-dark' : currentStep > 1 ? 'fw-bold text-success' : 'text-muted'}>Horario</span>
                         {currentStep === 1 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>

                     {/* Connector Line */}
                     <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: currentStep > 1 ? '#28a745' : '#e9ecef' }}></div>

                     {/* Step 2: Categorías de precios */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 2 ? 'bg-primary text-white' : currentStep > 2 ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         {currentStep > 2 ? (
                           <i className="fas fa-check"></i>
                         ) : (
                           <span className="fw-bold">2</span>
                         )}
                       </div>
                       <div>
                         <span className={currentStep === 2 ? 'fw-bold text-dark' : currentStep > 2 ? 'fw-bold text-success' : 'text-muted'}>Categorías de precios</span>
                         {currentStep === 2 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>

                     {/* Connector Line */}
                     <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: currentStep > 2 ? '#28a745' : '#e9ecef' }}></div>

                     {/* Step 3: Capacidad */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 3 ? 'bg-primary text-white' : currentStep > 3 ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         {currentStep > 3 ? (
                           <i className="fas fa-check"></i>
                         ) : (
                           <span className="fw-bold">3</span>
                         )}
                       </div>
                       <div>
                         <span className={currentStep === 3 ? 'fw-bold text-dark' : currentStep > 3 ? 'fw-bold text-success' : 'text-muted'}>Capacidad</span>
                         {currentStep === 3 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>

                     {/* Connector Line */}
                     <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: currentStep > 3 ? '#28a745' : '#e9ecef' }}></div>

                     {/* Step 4: Precio */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 4 ? 'bg-primary text-white' : currentStep > 4 ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         {currentStep > 4 ? (
                           <i className="fas fa-check"></i>
                         ) : (
                           <span className="fw-bold">4</span>
                         )}
                       </div>
                       <div>
                         <span className={currentStep === 4 ? 'fw-bold text-dark' : currentStep > 4 ? 'fw-bold text-success' : 'text-muted'}>Precio</span>
                         {currentStep === 4 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>

                     {/* Connector Line */}
                     <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: currentStep > 4 ? '#28a745' : '#e9ecef' }}></div>

                     {/* Step 5: Actividades complementarias */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 5 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         <span className="fw-bold">5</span>
                       </div>
                       <div>
                         <span className={currentStep === 5 ? 'fw-bold text-dark' : 'text-muted'}>Actividades complementarias (opcionales)</span>
                         {currentStep === 5 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>
                   </div>
                 </div>

                  {/* Step Content - Conditional Display */}
                  {currentStep === 1 ? (
                    // Paso 1: Horario - Contenido completo
                    <div>
                      {/* Nombre del horario */}
                      <div className="mb-4">
                        <label htmlFor="scheduleName" className="form-label fw-bold">
                          {getTranslation('stepSchedule.name.title', language)}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="scheduleName"
                          maxLength={50}
                          value={formData.scheduleName}
                          onChange={(e) => setFormData({...formData, scheduleName: e.target.value})}
                          placeholder={getTranslation('stepSchedule.name.placeholder', language)}
                        />
                        <div className="form-text text-muted mt-1">
                          {formData.scheduleName.length}/50 caracteres
                        </div>
                      </div>

                      {/* Fecha de inicio */}
                      <div className="mb-4">
                        <label htmlFor="startDate" className="form-label fw-bold">
                          {getTranslation('stepSchedule.startDate.title', language)}
                        </label>
                        <div className="input-group">
                          <input
                            type="date"
                            className="form-control"
                            id="startDate"
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          />
                          <span className="input-group-text">
                            <i className="fas fa-calendar"></i>
                          </span>
                        </div>
                        
                        <div className="form-check mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="hasEndDate"
                            checked={formData.hasEndDate}
                            onChange={(e) => setFormData({...formData, hasEndDate: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="hasEndDate">
                            {getTranslation('stepSchedule.startDate.hasEndDate', language)}
                          </label>
                        </div>

                        {formData.hasEndDate && (
                          <div className="mt-2">
                            <input
                              type="date"
                              className="form-control"
                              value={formData.endDate}
                              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                              min={formData.startDate}
                            />
                          </div>
                        )}
                      </div>

                      {/* Horario semanal estándar */}
                      <div className="mb-4">
                        <div className="mb-3">
                          <h5 className="fw-bold mb-0">
                            {getTranslation('stepSchedule.weeklySchedule.title', language)}
                          </h5>
                        </div>

                        <div className="row">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                            <div key={day} className="col-12 mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <span className="fw-semibold me-3" style={{ minWidth: '100px' }}>
                                  {getTranslation(`stepSchedule.weeklySchedule.${day}`, language)}
                                </span>
                                <button 
                                  type="button" 
                                  className="btn btn-link text-primary p-0"
                                  onClick={() => handleAddTimeSlot(day)}
                                >
                                  <i className="fas fa-plus me-1"></i>
                                  {getTranslation('stepSchedule.weeklySchedule.addTimeSlot', language)}
                                </button>
                              </div>
                              
                              {/* Display existing time slots */}
                              {(formData.timeSlots[day] || []).map((timeSlot) => (
                                <div key={timeSlot.id} className="d-flex align-items-center mb-2 ms-4">
                                  {/* Time input fields */}
                                  <div className="d-flex align-items-center me-3">
                                    <select
                                      className="form-select me-1"
                                      style={{ width: '70px' }}
                                      value={timeSlot.hour}
                                      onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'hour', e.target.value)}
                                    >
                                      {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                          {i.toString().padStart(2, '0')}
                                        </option>
                                      ))}
                                    </select>
                                    <span className="fw-bold me-1">:</span>
                                    <select
                                      className="form-select"
                                      style={{ width: '70px' }}
                                      value={timeSlot.minute}
                                      onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'minute', e.target.value)}
                                    >
                                      {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                          {i.toString().padStart(2, '0')}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  
                                  {/* Action buttons */}
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm me-2"
                                    onClick={() => handleRemoveTimeSlot(day, timeSlot.id)}
                                    title="Eliminar franja horaria"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                  
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleAddTimeSlot(day)}
                                    title="Añadir franja horaria"
                                  >
                                    <i className="fas fa-plus"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Excepciones */}
                      <div className="mb-4">
                        <h5 className="fw-bold mb-3">
                          {getTranslation('stepSchedule.exceptions.title', language)}
                        </h5>
                        <p className="text-muted mb-3">
                          {getTranslation('stepSchedule.exceptions.description', language)}
                        </p>

                        {formData.exceptions.map((exception, index) => (
                          <div key={index} className="row mb-3">
                            <div className="col-md-4">
                              <input
                                type="date"
                                className="form-control"
                                value={exception.date}
                                onChange={(e) => handleExceptionChange(index, 'date', e.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <input
                                type="text"
                                className="form-control"
                                placeholder={getTranslation('stepSchedule.exceptions.descriptionPlaceholder', language)}
                                value={exception.description}
                                onChange={(e) => handleExceptionChange(index, 'description', e.target.value)}
                              />
                            </div>
                            <div className="col-md-2">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleRemoveException(index)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ))}

                        <button 
                          type="button" 
                          className="btn btn-primary"
                          onClick={handleAddException}
                        >
                          <i className="fas fa-plus me-2"></i>
                          {getTranslation('stepSchedule.exceptions.addDate', language)}
                        </button>
                      </div>
                    </div>
                    ) : currentStep === 2 ? (
                     // Paso 2: Categorías de precios
                     <div>
                       <h5 className="fw-bold mb-4">
                         Cuéntanos más sobre tus precios:
                       </h5>
                       
                       <div className="mb-4">
                         <div className="form-check mb-3">
                           <input
                             className="form-check-input"
                             type="radio"
                             name="pricingType"
                             id="samePrice"
                             value="same"
                             defaultChecked
                           />
                           <label className="form-check-label fw-semibold" htmlFor="samePrice">
                             El precio es igual para todos, por ejemplo: por participante
                           </label>
                         </div>
                         
                         <div className="form-check mb-3">
                           <input
                             className="form-check-input"
                             type="radio"
                             name="pricingType"
                             id="ageBasedPrice"
                             value="ageBased"
                           />
                           <label className="form-check-label fw-semibold" htmlFor="ageBasedPrice">
                             El precio depende de la edad, por ejemplo: adultos, niños, mayores, etc
                           </label>
                         </div>
                       </div>
                       
                       <div className="alert alert-info border-0 bg-light">
                         <div className="d-flex align-items-start">
                           <i className="fas fa-info-circle text-primary me-2 mt-1"></i>
                           <div>
                             <p className="mb-0 text-muted">
                               Ofrecer varios tipos de participantes puede aumentar tus reservas hasta 3 veces comparado con las actividades que solo tiene un tipo de participante.
                             </p>
                           </div>
                         </div>
                       </div>
                     </div>
                     ) : currentStep === 3 ? (
                      // Paso 3: Capacidad
                      <div>
                        <h5 className="fw-bold mb-4 text-dark">
                          Veamos la capacidad
                        </h5>
                        
                        <h6 className="fw-bold mb-4 text-dark">
                          ¿Cuántos participantes puedes aceptar por franja horaria?
                        </h6>
                        
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <label htmlFor="minParticipants" className="form-label text-muted d-flex align-items-center">
                              Número mínimo de participantes
                              <i className="fas fa-info-circle ms-2 text-muted" style={{ fontSize: '14px' }}></i>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              id="minParticipants"
                              min="1"
                              defaultValue="1"
                            />
                          </div>
                          
                          <div className="col-md-6 mb-4">
                            <label htmlFor="maxParticipants" className="form-label text-muted">
                              Número máximo de participantes
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              id="maxParticipants"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                      ) : currentStep === 4 ? (
                       // Paso 4: Precio
                       <div>
                         <h5 className="fw-bold mb-4 text-dark">
                           Establece el precio de tu actividad
                         </h5>
                         
                         <h6 className="fw-bold mb-4 text-dark">
                           Participante
                         </h6>
                         
                         <div className="row">
                           <div className="col-md-3 mb-4">
                             <label className="form-label text-muted">
                               Número de personas
                             </label>
                             <div className="d-flex align-items-center">
                               <span className="text-muted me-2">1 a 20</span>
                               <i className="fas fa-info-circle text-muted" style={{ fontSize: '14px' }}></i>
                             </div>
                           </div>
                           
                           <div className="col-md-3 mb-4">
                             <label className="form-label text-muted">
                               El cliente paga
                             </label>
                             <input
                               type="text"
                               className="form-control"
                               placeholder="USD"
                             />
                           </div>
                           
                           <div className="col-md-3 mb-4">
                             <label className="form-label text-muted">
                               Comisión
                             </label>
                             <input
                               type="text"
                               className="form-control"
                               value="30%"
                               readOnly
                             />
                           </div>
                           
                           <div className="col-md-3 mb-4">
                             <label className="form-label text-muted">
                               Precio por participante
                             </label>
                             <input
                               type="text"
                               className="form-control"
                               placeholder=""
                             />
                           </div>
                         </div>
                         
                         <div className="mt-4">
                           <button 
                             type="button" 
                             className="btn btn-link text-primary p-0 d-flex align-items-center"
                           >
                             <i className="fas fa-plus me-2"></i>
                             Precio por nivel
                           </button>
                         </div>
                       </div>
                        ) : currentStep === 5 ? (
                        // Paso 5: Actividades complementarias (opcional)
                        <div>
                          <h5 className="fw-bold mb-4 text-dark">
                            Actividades complementarias (opcional)
                          </h5>
                          
                          <h6 className="fw-bold mb-4 text-dark">
                            ¿Qué es una actividad complementaria?
                          </h6>
                          
                          <p className="text-muted mb-4">
                            Ofrece servicios o elementos adicionales para tus actividades con el fin de mejorar la experiencia de los viajeros.
                          </p>
                          
                          <div className="d-flex justify-content-center mb-4">
                            <div className="input-group" style={{ maxWidth: '400px' }}>
                              <span className="input-group-text bg-white border-end-0">
                                <i className="fas fa-search text-muted"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search..."
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Error para valores de step no válidos
                        <div className="mb-5">
                          <div className="alert alert-danger border-0">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-exclamation-triangle me-3 text-danger"></i>
                              <div>
                                <h5 className="alert-heading text-danger mb-2">
                                  Paso no válido
                                </h5>
                                <p className="mb-0 text-danger">
                                  El valor del paso "{currentStep}" no es válido. Solo se permiten pasos del 1 al 5.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                {/* Botones de navegación */}
                <div className="d-flex justify-content-between mt-5">
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={handleBack}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    {getTranslation('stepSchedule.buttons.back', language)}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSaveAndContinue}
                  >
                    {getTranslation('stepSchedule.buttons.saveAndContinue', language)}
                    <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OptionSetupLayout>
  );
}
