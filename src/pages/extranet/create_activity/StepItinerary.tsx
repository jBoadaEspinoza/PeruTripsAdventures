import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import ActivityCreationLayout from '../../../components/ActivityCreationLayout';
import { useAppSelector, useAppDispatch } from '../../../redux/store';
import { setCurrentStep } from '../../../redux/activityCreationSlice';

const StepItinerary: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const dispatch = useAppDispatch();
  const { activityId, selectedCategory } = useAppSelector(state => state.activityCreation);

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

  return (
    <ActivityCreationLayout totalSteps={10}>
      <div className="container-fluid">
        {/* Header con barra de progreso */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Creador de Itinerarios</h4>
              <div className="d-flex align-items-center">
                <div className="progress me-3" style={{ width: '200px', height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: '90%' }}
                  ></div>
                </div>
                <span className="text-muted">90%</span>
              </div>
            </div>
          </div>
        </div>

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

                {/* Placeholder content */}
                <div className="text-center py-5">
                  <i className="fas fa-route fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">
                    {getTranslation('stepItinerary.placeholder.title', language)}
                  </h5>
                  <p className="text-muted">
                    {getTranslation('stepItinerary.placeholder.description', language)}
                  </p>
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
            >
              {getTranslation('common.continue', language)}
              <i className="fas fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </ActivityCreationLayout>
  );
};

export default StepItinerary;

