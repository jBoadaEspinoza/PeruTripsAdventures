import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import OptionSetupLayout from '../../../components/OptionSetupLayout';
import { useAppSelector } from '../../../redux/store';
import { useActivityParams } from '../../../hooks/useActivityParams';
import { navigateToActivityStep } from '../../../utils/navigationUtils';
import { bookingOptionApi, CreateBookingOptionAvailabilityPricingRequest } from '../../../api/bookingOption';

interface AvailabilityPricingData {
  availabilityType: 'timeSlots' | 'openingHours';
  pricingType: 'perPerson' | 'perGroup';
}

export default function StepOptionAvailabilityPrice() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Obtener parámetros de URL
  const { activityId, lang, currency, currentStep } = useActivityParams();
  
  const [formData, setFormData] = useState<AvailabilityPricingData>({
    availabilityType: 'timeSlots',
    pricingType: 'perPerson'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvailabilityPricingCompleted, setIsAvailabilityPricingCompleted] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);

  const optionId = searchParams.get('optionId');
  const storageKey = `availabilityPricing_${optionId || 'default'}`;

  // Cargar datos guardados al inicializar
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        console.log('StepOptionAvailabilityPrice: Datos cargados desde localStorage:', parsedData);
      } catch (error) {
        console.error('StepOptionAvailabilityPrice: Error al cargar datos desde localStorage:', error);
      }
    }
  }, [storageKey]);

  // Verificar si la disponibilidad y precios están completos
  useEffect(() => {
    const checkAvailabilityPricingCompletion = async () => {
      if (!optionId) {
        setIsCheckingCompletion(false);
        return;
      }

      try {
        setIsCheckingCompletion(true);
        const response = await bookingOptionApi.isBookingOptionAvailabilityPricingCompleted(optionId);
        
        if (response.success && response.data?.isComplete) {
          setIsAvailabilityPricingCompleted(true);
        } else {
          setIsAvailabilityPricingCompleted(false);
        }
      } catch (error) {
        console.error('StepOptionAvailabilityPrice: Error al verificar completitud:', error);
        setIsAvailabilityPricingCompleted(false);
      } finally {
        setIsCheckingCompletion(false);
      }
    };

    checkAvailabilityPricingCompletion();
  }, [optionId]);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
      console.log('StepOptionAvailabilityPrice: Datos guardados en localStorage:', formData);
    }
  }, [formData, storageKey]);

  const handleAddSchedule = async () => {
    if (!optionId || !activityId) {
      alert('Error: Faltan datos requeridos para crear el horario.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiRequest: CreateBookingOptionAvailabilityPricingRequest = {
        activityId: activityId,
        bookingOptionId: optionId,
        availabilityMode: formData.availabilityType === 'timeSlots' ? 'TIME_SLOTS' : 'OPENING_HOURS',
        pricingMode: formData.pricingType === 'perPerson' ? 'PER_PERSON' : 'PER_GROUP'
      };

      console.log('StepOptionAvailabilityPrice: Enviando datos a la API:', apiRequest);

      const response = await bookingOptionApi.createBookingOptionAvailabilityPricing(apiRequest);

      if (response && response.success) {
        console.log('StepOptionAvailabilityPrice: Horario creado exitosamente:', response);
        
        // Navegar a la página de creación de horarios con los parámetros requeridos
        const currency = 'PEN'; // Por defecto, se puede obtener del contexto si está disponible
        navigateToActivityStep(navigate, `/extranet/activity/availabilityPricing/create?optionId=${optionId}&step=1`, {
          activityId,
          lang,
          currency,
          currentStep
        });
      } else {
        console.error('StepOptionAvailabilityPrice: Error en la API:', response?.message);
        alert(`Error al crear el horario: ${response?.message || 'Error desconocido'}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('StepOptionAvailabilityPrice: Error al consumir la API:', error);
      alert('Error inesperado al crear el horario. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    console.log('StepOptionAvailabilityPrice: Continuando con datos:', formData);
    // navega a la página de configuración de corte
    const currency = 'PEN'; // Por defecto, se puede obtener del contexto si está disponible
    navigateToActivityStep(navigate, `/extranet/activity/cutOff?optionId=${optionId}`, {
      activityId,
      lang,
      currency,
      currentStep
    });
  };

  const handleBack = () => {
    console.log('StepOptionAvailabilityPrice: Datos mantenidos en localStorage al regresar');
    navigateToActivityStep(navigate, '/extranet/activity/meetingPickup', {
      activityId,
      lang,
      currency,
      currentStep
    });
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
                <p className="text-muted">Cargando configuración de disponibilidad y precios...</p>
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
                    onClick={() => navigateToActivityStep(navigate, '/extranet/activity/createCategory', {
                      activityId,
                      lang,
                      currency,
                      currentStep
                    })}
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
                {/* Header con título */}
                <div className="d-flex align-items-center mb-4">
                  <h4 className="mb-0 me-2">
                    {getTranslation('stepAvailabilityPricing.title', language)}
                  </h4>
                  <i className="fas fa-info-circle text-primary"></i>
                  
                  {/* Indicador de estado de completitud */}
                  {!isCheckingCompletion && (
                    <div className="ms-auto">
                      {isAvailabilityPricingCompleted ? (
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i>
                          {language === 'es' ? 'Completo' : 'Complete'}
                        </span>
                      ) : (
                        <span className="badge bg-warning text-dark">
                          <i className="fas fa-clock me-1"></i>
                          {language === 'es' ? 'Pendiente' : 'Pending'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Descripción introductoria */}
                <p className="text-muted mb-4">
                  {getTranslation('stepAvailabilityPricing.description', language)}
                </p>

                {/* Indicador de carga inicial */}
                {isCheckingCompletion && (
                  <div className="text-center mb-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Verificando estado...</span>
                    </div>
                    <p className="text-muted mt-2">
                      {language === 'es' 
                        ? 'Verificando estado de la configuración de disponibilidad y precios...'
                        : 'Checking availability and pricing configuration status...'
                      }
                    </p>
                  </div>
                )}

                {/* Sección 1: ¿Cómo estableces tu disponibilidad? */}
                <div className="mb-5">
                  <h5 className="fw-bold mb-3">
                    {getTranslation('stepAvailabilityPricing.availability.title', language)}
                  </h5>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="availabilityType"
                      id="timeSlots"
                      value="timeSlots"
                      checked={formData.availabilityType === 'timeSlots'}
                      onChange={(e) => setFormData({...formData, availabilityType: e.target.value as 'timeSlots' | 'openingHours'})}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="timeSlots">
                      {getTranslation('stepAvailabilityPricing.availability.timeSlots', language)}
                    </label>
                    <div className="ms-4 mt-2">
                      <small className="text-muted">
                        {getTranslation('stepAvailabilityPricing.availability.timeSlots.example', language)}
                      </small>
                    </div>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="availabilityType"
                      id="openingHours"
                      value="openingHours"
                      checked={formData.availabilityType === 'openingHours'}
                      onChange={(e) => setFormData({...formData, availabilityType: e.target.value as 'timeSlots' | 'openingHours'})}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="openingHours">
                      {getTranslation('stepAvailabilityPricing.availability.openingHours', language)}
                    </label>
                    <div className="ms-4 mt-2">
                      <small className="text-muted">
                        {getTranslation('stepAvailabilityPricing.availability.openingHours.example', language)}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Sección 2: ¿Cómo se fijan los precios? */}
                <div className="mb-5">
                  <h5 className="fw-bold mb-3">
                    {getTranslation('stepAvailabilityPricing.pricing.title', language)}
                  </h5>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="pricingType"
                      id="perPerson"
                      value="perPerson"
                      checked={formData.pricingType === 'perPerson'}
                      onChange={(e) => setFormData({...formData, pricingType: e.target.value as 'perPerson' | 'perGroup'})}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="perPerson">
                      {getTranslation('stepAvailabilityPricing.pricing.perPerson', language)}
                    </label>
                    <div className="ms-4 mt-2">
                      <small className="text-muted">
                        {getTranslation('stepAvailabilityPricing.pricing.perPerson.description', language)}
                      </small>
                    </div>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="pricingType"
                      id="perGroup"
                      value="perGroup"
                      checked={formData.pricingType === 'perGroup'}
                      onChange={(e) => setFormData({...formData, pricingType: e.target.value as 'perPerson' | 'perGroup'})}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="perGroup">
                      {getTranslation('stepAvailabilityPricing.pricing.perGroup', language)}
                    </label>
                    <div className="ms-4 mt-2">
                      <small className="text-muted">
                        {getTranslation('stepAvailabilityPricing.pricing.perGroup.description', language)}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Botón para añadir nuevo horario */}
                <div className="text-left mb-4">
                  <button 
                    type="button" 
                    className="btn btn-primary btn-lg px-4 py-2"
                    style={{ 
                      backgroundColor: '#007bff', 
                      borderColor: '#007bff',
                      color: 'white',
                      fontWeight: '500'
                    }}
                    onClick={handleAddSchedule}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="fas fa-plus me-2"></i>
                    )}
                    {getTranslation('stepAvailabilityPricing.addSchedule', language)}
                  </button>
                </div>

                {/* Botones de navegación */}
                <div className="d-flex justify-content-between mt-5">
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={handleBack}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    {getTranslation('stepAvailabilityPricing.buttons.back', language)}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleContinue}
                    disabled={isCheckingCompletion || !isAvailabilityPricingCompleted}
                  >
                    {isCheckingCompletion ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="fas fa-arrow-right me-2"></i>
                    )}
                    {getTranslation('stepAvailabilityPricing.buttons.continue', language)}
                  </button>
                </div>

                {/* Mensaje informativo sobre el estado del botón Continuar */}
                {!isCheckingCompletion && (
                  <div className="mt-3 text-center">
                    {isAvailabilityPricingCompleted ? (
                      <div className="text-success">
                        <i className="fas fa-check-circle me-2"></i>
                        <small>
                          {language === 'es' 
                            ? 'La configuración de disponibilidad y precios está completa. Puedes continuar al siguiente paso.'
                            : 'Availability and pricing configuration is complete. You can continue to the next step.'
                          }
                        </small>
                      </div>
                    ) : (
                      <div className="text-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <small>
                          {language === 'es' 
                            ? 'La configuración de disponibilidad y precios no está completa. Completa la configuración antes de continuar.'
                            : 'Availability and pricing configuration is not complete. Complete the configuration before continuing.'
                          }
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OptionSetupLayout>
  );
}
