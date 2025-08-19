import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import OptionSetupLayout from '../../../components/OptionSetupLayout';
import { useAppSelector, useAppDispatch } from '../../../redux/store';
import { setCurrentStep } from '../../../redux/activityCreationSlice';
import { useExtranetAuth } from '../../../hooks/useExtranetAuth';
import { resetActivityCreation } from '../../../redux/activityCreationSlice';
import { bookingOptionApi } from '../../../api/bookingOption';
import type { CreateBookingOptionSetupRequest } from '../../../api/bookingOption';

interface OptionSetupData {
  optionTitle: string;
  maxGroupSize: number; // -1 representa "Sin Límite"
  languages: Array<{ name: string; code: string }>;
  guideMaterials: boolean;
  isPrivate: boolean;
  skipLines: boolean;
  skipLineType: string;
  wheelchairAccessible: boolean;
  durationType: 'duration' | 'validity';
  durationDays: number;
  durationHours: number;
  durationMinutes: number;
}

export default function StepOptionSetup() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { activityId, selectedCategory, currentStep } = useAppSelector(state => state.activityCreation);
  const { isAuthenticated, isInitialized, isValidating } = useExtranetAuth();
  
  const [formData, setFormData] = useState<OptionSetupData>({
    optionTitle: '',
    maxGroupSize: -1, // -1 representa "Sin Límite"
    languages: [
      { name: 'Español', code: 'es' },
      { name: 'Inglés', code: 'en' }
    ],
    guideMaterials: false,
    isPrivate: false,
    skipLines: false,
    skipLineType: '',
    wheelchairAccessible: false,
    durationType: 'duration',
    durationDays: 0,
    durationHours: 0,
    durationMinutes: 0
  });

  const [searchLanguage, setSearchLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLanguages] = useState([
    { name: 'Español', code: 'es' },
    { name: 'Inglés', code: 'en' },
    { name: 'Francés', code: 'fr' },
    { name: 'Alemán', code: 'de' },
    { name: 'Italiano', code: 'it' },
    { name: 'Portugués', code: 'pt' },
    { name: 'Ruso', code: 'ru' },
    { name: 'Chino', code: 'zh' },
    { name: 'Japonés', code: 'ja' },
    { name: 'Árabe', code: 'ar' }
  ]);

  // Obtener el optionId de la URL
  const optionId = searchParams.get('optionId');

  // Clave para localStorage
  const storageKey = `optionSetup_${optionId || 'default'}`;

  // Cargar datos guardados al inicializar
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        console.log('StepOptionSetup: Datos cargados desde localStorage:', parsedData);
      } catch (error) {
        console.error('StepOptionSetup: Error al cargar datos desde localStorage:', error);
      }
    }
  }, [storageKey]);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
      console.log('StepOptionSetup: Datos guardados en localStorage:', formData);
    }
  }, [formData, storageKey]);

  useEffect(() => {
    dispatch(setCurrentStep(9)); // StepOptionSetup es el paso 9 (configuración de opción)
  }, [dispatch]);

  useEffect(() => {
    // Solo validar autenticación, no redirigir por falta de datos
    if (isInitialized && !isValidating) {
      if (!isAuthenticated) {
        console.log('StepOptionSetup: Usuario no autenticado, redirigiendo a login');
        navigate('/extranet/login');
        return;
      }
      
      // Si está autenticado, solo mostrar logs informativos
      if (!activityId) {
        console.log('StepOptionSetup: No se encontró activityId en Redux, pero continuando...');
        // No redirigir, solo mostrar mensaje informativo
      }
      
      if (!optionId) {
        console.log('StepOptionSetup: No se encontró optionId en la URL, pero continuando...');
        // No redirigir, solo mostrar mensaje informativo
      }
      
      console.log('StepOptionSetup: Cargando con activityId:', activityId, 'y optionId:', optionId);
    }
  }, [isAuthenticated, isInitialized, isValidating, activityId, optionId, navigate]);

  useEffect(() => {
    // Ajustar los valores de duración cuando cambien las unidades
    if (formData.durationType === 'duration') {
      // Validar días (0-30)
      if (formData.durationDays > 30) {
        setFormData(prev => ({ ...prev, durationDays: 30 }));
      }
      if (formData.durationDays < 0) {
        setFormData(prev => ({ ...prev, durationDays: 0 }));
      }
      
      // Validar horas (0-23)
      if (formData.durationHours > 23) {
        setFormData(prev => ({ ...prev, durationHours: 23 }));
      }
      if (formData.durationHours < 0) {
        setFormData(prev => ({ ...prev, durationHours: 0 }));
      }
      
      // Validar minutos (0-59)
      if (formData.durationMinutes > 59) {
        setFormData(prev => ({ ...prev, durationMinutes: 59 }));
      }
      if (formData.durationMinutes < 0) {
        setFormData(prev => ({ ...prev, durationMinutes: 0 }));
      }
      
      // Si hay días, las horas no pueden exceder 23
      if (formData.durationDays > 0 && formData.durationHours >= 24) {
        setFormData(prev => ({ ...prev, durationHours: 23 }));
      }
    } else if (formData.durationType === 'validity') {
      // Validar días de validez (1-365)
      if (formData.durationDays > 365) {
        setFormData(prev => ({ ...prev, durationDays: 365 }));
      }
      if (formData.durationDays < 1) {
        setFormData(prev => ({ ...prev, durationDays: 1 }));
      }
      
      // Resetear horas y minutos para validez
      if (formData.durationHours > 0 || formData.durationMinutes > 0) {
        setFormData(prev => ({ ...prev, durationHours: 0, durationMinutes: 0 }));
      }
    }
  }, [formData.durationDays, formData.durationHours, formData.durationMinutes, formData.durationType]);

  useEffect(() => {
    if (!activityId) {
      console.log('StepOptionSetup: No se encontró activityId, redirigiendo a createCategory');
      navigate('/extranet/activity/createCategory');
      return;
    }

    if (!optionId) {
      console.log('StepOptionSetup: No se encontró optionId en la URL, redirigiendo a createOptions');
      navigate('/extranet/activity/createOptions');
      return;
    }

    console.log('StepOptionSetup: Cargando con activityId:', activityId, 'y optionId:', optionId);
  }, [activityId, optionId, navigate]);

  const handleLanguageToggle = (languageName: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.some(lang => lang.name === languageName)
        ? prev.languages.filter(lang => lang.name !== languageName)
        : [...prev.languages, availableLanguages.find(lang => lang.name === languageName)!]
    }));
  };

  const handleLanguageSearch = (searchTerm: string) => {
    setSearchLanguage(searchTerm);
  };

  const handleLanguageSelect = (selectedLanguage: string) => {
    const languageObj = availableLanguages.find(lang => lang.name === selectedLanguage);
    if (languageObj && !formData.languages.some(lang => lang.name === languageObj.name)) {
      handleLanguageToggle(languageObj.name);
      setSearchLanguage('');
    }
  };

  const filteredLanguages = availableLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchLanguage.toLowerCase())
  );

  const handleContinue = async () => {
    if (isSubmitting) return; // Prevenir múltiples envíos
    
    setIsSubmitting(true);
    try {
      // Preparar los datos para la API
      const request: CreateBookingOptionSetupRequest = {
        activityId: activityId!,
        bookingOptionId: optionId!,
        title: formData.optionTitle,
        maxGroupSize: formData.maxGroupSize === -1 ? null : formData.maxGroupSize,
        guideLanguages: formData.languages.map(lang => lang.code),
        isPrivate: formData.isPrivate,
        isOpenDuration: formData.durationType === 'validity',
        durationDays: formData.durationType === 'duration' ? formData.durationDays : null,
        durationHours: formData.durationType === 'duration' ? formData.durationHours : null,
        durationMinutes: formData.durationType === 'duration' ? formData.durationMinutes : null,
        validityDays: formData.durationType === 'validity' ? formData.durationDays : null
      };

      console.log('StepOptionSetup: Enviando request a createSetup:', request);

      // Llamar a la API
      const response = await bookingOptionApi.createSetup(request);

      if (response.success) {
        console.log('StepOptionSetup: Setup creado exitosamente con ID:', response.idCreated);
        
        // No limpiar localStorage aún, faltan varios pasos por completar
        console.log('StepOptionSetup: Datos mantenidos en localStorage para siguientes pasos');
        
        // Navegar al siguiente paso
        navigate(`/extranet/activity/createOptionMeetingPickup?optionId=${response.idCreated}`);
      } else {
        console.error('StepOptionSetup: Error al crear setup:', response.message);
        // Aquí podrías mostrar un mensaje de error al usuario
        alert(`Error al guardar la configuración: ${response.message}`);
      }
    } catch (error) {
      console.error('StepOptionSetup: Error inesperado:', error);
      alert('Error inesperado al guardar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // No limpiar el estado de Redux aquí, mantenerlo para regresar
    navigate('/extranet/activity/createOptions');
  };

  // Función para limpiar todo el estado cuando sea necesario
  const handleResetAll = () => {
    // Limpiar localStorage
    localStorage.removeItem(storageKey);
    
    // Limpiar estado de Redux
    dispatch(resetActivityCreation());
    
    console.log('StepOptionSetup: Estado completo limpiado');
    navigate('/extranet/activity/createCategory');
  };

  // Si no hay optionId, mostrar mensaje de carga o redirigir
  if (!optionId) {
    return (
      <OptionSetupLayout currentSection="optionSettings">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted">{getTranslation('stepOptionSetup.loading', language)}</p>
              </div>
            </div>
          </div>
        </div>
      </OptionSetupLayout>
    );
  }

  // Si no hay activityId, mostrar mensaje informativo
  if (!activityId) {
    return (
      <OptionSetupLayout currentSection="optionSettings">
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
                  <div className="d-flex gap-2 justify-content-center">
                    <button 
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => navigate('/extranet/activity/createCategory')}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      {language === 'es' ? 'Ir a Categoría' : 'Go to Category'}
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleResetAll}
                    >
                      <i className="fas fa-redo me-2"></i>
                      {language === 'es' ? 'Reiniciar Todo' : 'Reset All'}
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

  return (
    <OptionSetupLayout currentSection="optionSettings">
      <div className="container-fluid">
        {/* Contenido principal */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {/* Título de la opción */}
                <div className="mb-5">
                  <h6 className="fw-bold mb-3 text-primary">
                    {getTranslation('stepOptions.createForm.titleLabel', language)}
                  </h6>
                  
                  {/* Mensaje de persistencia de datos */}
                  <div className="alert alert-info mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <small>
                      {language === 'es' 
                        ? 'Tu progreso se guarda automáticamente. Puedes recargar la página sin perder la información ingresada. El estado de la actividad también se mantiene.'
                        : 'Your progress is automatically saved. You can reload the page without losing the entered information. The activity state is also maintained.'
                      }
                    </small>
                  </div>
                  
                  <p className="text-muted mb-3">
                    {language === 'es' 
                      ? 'Si ofreces varias opciones, escribe un título breve que explique claramente al cliente en qué se diferencia esta opción de las demás.'
                      : 'If you offer several options, write a brief title that clearly explains to the customer how this option differs from the others.'
                    }
                  </p>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.optionTitle}
                      onChange={(e) => setFormData({...formData, optionTitle: e.target.value})}
                      maxLength={60}
                      placeholder={language === 'es' ? 'Por favor inserta tu texto en español' : 'Please insert your text in English'}
                    />
                    <div className="text-muted small mt-1 text-end">
                      {formData.optionTitle.length} / 60
                    </div>
                  </div>
                </div>

                {/* Tamaño máximo del grupo */}
                <div className="mb-5">
                  <h6 className="fw-bold mb-3">
                    {getTranslation('stepOptionSetup.maxGroupSize.title', language)}
                  </h6>
                  <p className="text-muted mb-3">
                    {getTranslation('stepOptionSetup.maxGroupSize.description', language)}
                  </p>
                  <select
                    className="form-select"
                    value={formData.maxGroupSize}
                    onChange={(e) => setFormData({...formData, maxGroupSize: parseInt(e.target.value)})}
                    style={{ width: '200px' }}
                  >
                    <option value={-1}>Sin Límite</option>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                {/* Configuración de opciones */}
                <div className="mb-5">
                  <div className="d-flex align-items-center mb-3">
                    <h6 className="fw-bold mb-0 me-2">
                      {getTranslation('stepOptionSetup.optionConfig.title', language)}
                    </h6>
                    <span className="badge bg-primary small">Personalizable</span>
                    <i className="fas fa-info-circle text-primary ms-2"></i>
                  </div>

                  {/* Idiomas */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-2">
                      {getTranslation('stepOptionSetup.languages.title', language)}
                    </h6>
                    <p className="text-muted small mb-2">
                      {getTranslation('stepOptionSetup.languages.instructions', language)}
                    </p>
                    <div className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={getTranslation('stepOptionSetup.languages.search', language)}
                          value={searchLanguage}
                          onChange={(e) => setSearchLanguage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchLanguage) {
                              e.preventDefault();
                              handleLanguageSelect(searchLanguage);
                            }
                          }}
                          list="languagesList"
                          autoComplete="off"
                        />
                        <datalist id="languagesList">
                          {availableLanguages.map(lang => (
                            <option key={lang.name} value={lang.name} />
                          ))}
                        </datalist>
                      </div>
                      <small className="text-muted">
                        Busca idiomas en la lista predefinida. Presiona Enter para agregar el idioma seleccionado con su código ISO.
                      </small>
                    </div>
                    
                    {/* Idiomas seleccionados */}
                    {formData.languages.length > 0 && (
                      <div className="mb-3">
                        <h6 className="fw-bold mb-2">Idiomas seleccionados:</h6>
                        <div className="d-flex flex-wrap gap-1">
                        {formData.languages.map(lang => (
                            <span key={lang.name} className="badge bg-primary language-badge">
                              {lang.name} <span className="ms-1 text-light">({lang.code})</span>
                            <button
                              type="button"
                                className="btn-close btn-close-white"
                                onClick={() => handleLanguageToggle(lang.name)}
                            ></button>
                          </span>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actividad privada */}
                <div className="mb-5">
                  <h6 className="fw-bold mb-3">
                    {getTranslation('stepOptionSetup.privateActivity.title', language)}
                  </h6>
                  <p className="text-muted mb-3">
                    {getTranslation('stepOptionSetup.privateActivity.description', language)}
                  </p>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="privateActivity"
                      id="privateNo"
                      checked={!formData.isPrivate}
                      onChange={() => setFormData({...formData, isPrivate: false})}
                    />
                    <label className="form-check-label" htmlFor="privateNo">
                      {getTranslation('stepOptionSetup.privateActivity.no', language)}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="privateActivity"
                      id="privateYes"
                      checked={formData.isPrivate}
                      onChange={() => setFormData({...formData, isPrivate: true})}
                    />
                    <label className="form-check-label" htmlFor="privateYes">
                      {getTranslation('stepOptionSetup.privateActivity.yes', language)}
                    </label>
                  </div>
                </div>
                {/* Duración o validez */}
                <div className="mb-5">
                  <div className="d-flex align-items-center mb-3">
                    <h6 className="fw-bold mb-0 me-2">
                      {getTranslation('stepOptionSetup.duration.title', language)}
                    </h6>
                    <span className="badge bg-primary small">Personalizable</span>
                    <i className="fas fa-info-circle text-primary ms-2"></i>
                  </div>
                  
                  <p className="text-muted mb-3">
                    {getTranslation('stepOptionSetup.duration.description', language)}
                  </p>
                  
                  <h6 className="fw-bold mb-3">
                    {getTranslation('stepOptionSetup.duration.question', language)}
                  </h6>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="durationType"
                      id="durationType"
                      checked={formData.durationType === 'duration'}
                      onChange={() => setFormData({...formData, durationType: 'duration'})}
                    />
                    <label className="form-check-label" htmlFor="durationType">
                      {getTranslation('stepOptionSetup.duration.type.duration', language)}
                    </label>
                  </div>
                  
                  {formData.durationType === 'duration' && (
                    <div className="ms-4 mb-3">
                      <div className="row g-3" style={{ width: '400px' }}>
                        {/* Días */}
                        <div className="col-md-4">
                          <label className="form-label small fw-bold text-muted">Días</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.durationDays}
                            onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value) || 0})}
                            min="0"
                            max="30"
                            style={{ width: '100%' }}
                          />
                        </div>
                        
                        {/* Horas */}
                        <div className="col-md-4">
                          <label className="form-label small fw-bold text-muted">Horas</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.durationHours}
                            onChange={(e) => setFormData({...formData, durationHours: parseInt(e.target.value) || 0})}
                            min="0"
                            max="23"
                            step="1"
                            style={{ width: '100%' }}
                          />
                        </div>
                        
                        {/* Minutos */}
                        <div className="col-md-4">
                          <label className="form-label small fw-bold text-muted">Minutos</label>
                        <input
                          type="number"
                          className="form-control"
                            value={formData.durationMinutes}
                            onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})}
                            min="0"
                            max="59"
                            step="1"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      
                      {/* Resumen de duración */}
                      <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted">
                          <strong>Duración total:</strong> {
                            [
                              formData.durationDays > 0 ? `${formData.durationDays} día${formData.durationDays > 1 ? 's' : ''}` : '',
                              formData.durationHours > 0 ? `${formData.durationHours} hora${formData.durationHours > 1 ? 's' : ''}` : '',
                              formData.durationMinutes > 0 ? `${formData.durationMinutes} minuto${formData.durationMinutes > 1 ? 's' : ''}` : ''
                            ].filter(Boolean).join(', ') || '0 minutos'
                          }
                        </small>
                      </div>
                      
                      <small className="text-muted mt-2 d-block">
                        Configura la duración de tu actividad. Puedes usar días, horas y minutos por separado.
                      </small>
                    </div>
                  )}
                  
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="durationType"
                      id="validityType"
                      checked={formData.durationType === 'validity'}
                      onChange={() => setFormData({...formData, durationType: 'validity'})}
                    />
                    <label className="form-check-label" htmlFor="validityType">
                      {getTranslation('stepOptionSetup.duration.type.validity', language)}
                    </label>
                  </div>
                  
                  {/* Explicación de validez */}
                  {formData.durationType === 'validity' && (
                    <div className="ms-4 mb-3">
                      <div className="alert alert-info">
                        <small>
                          <i className="fas fa-info-circle me-2"></i>
                          <strong>Ejemplo:</strong> Tickets de entrada para museos que pueden utilizarse en cualquier momento durante el horario de apertura.
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Campo para días de validez */}
                  {formData.durationType === 'validity' && (
                    <div className="ms-4 mb-3">
                      <div className="row g-3" style={{ width: '300px' }}>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">Días de Validez</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.durationDays}
                            onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value) || 0})}
                            min="1"
                            max="365"
                            style={{ width: '100%' }}
                          />
                  </div>
                </div>

                      {/* Resumen de validez */}
                      <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted">
                          <strong>Período de validez:</strong> {
                            formData.durationDays === 1 
                              ? '1 día' 
                              : formData.durationDays > 0 
                                ? `${formData.durationDays} días`
                                : 'No configurado'
                          }
                        </small>
                      </div>
                      
                      <small className="text-muted mt-2 d-block">
                        Los clientes podrán usar su ticket en cualquier momento durante este período de validez.
                  </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
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
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <i className="fas fa-arrow-right ms-2"></i>
              )}
              {getTranslation('common.continue', language)}
            </button>
          </div>
        </div>
      </div>
    </OptionSetupLayout>
  );
};