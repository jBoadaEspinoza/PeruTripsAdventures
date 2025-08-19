import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import ActivityCreationLayout from '../../../components/ActivityCreationLayout';
import { useExtranetLoading } from '../../../hooks/useExtranetLoading';
import { useAppSelector, useAppDispatch } from '../../../redux/store';
import { setCurrentStep } from '../../../redux/activityCreationSlice';
import { activitiesApi } from '../../../api/activities';

const StepDescription: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { withLoading } = useExtranetLoading();
  const dispatch = useAppDispatch();
  const [presentation, setPresentation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Character limits
  const PRESENTATION_LIMIT = 200;
  const DESCRIPTION_LIMIT = 3000;

  // Obtener activityId y selectedCategory desde Redux
  const { activityId, selectedCategory } = useAppSelector(state => state.activityCreation);

  // Set current step when component mounts
  useEffect(() => {
    dispatch(setCurrentStep(3)); // StepDescription is step 3
  }, [dispatch]);

  useEffect(() => {
    // Verificar que tenemos activityId antes de continuar
    if (!activityId) {
      console.log('StepDescription: No se encontró activityId, redirigiendo a createCategory');
      navigate('/extranet/activity/createCategory');
    }
  }, [activityId, navigate]);

  // Log para debugging
  useEffect(() => {
    console.log('StepDescription - ActivityId:', activityId);
    console.log('StepDescription - SelectedCategory:', selectedCategory);
  }, [activityId, selectedCategory]);

  const handleContinue = async () => {
    if (!presentation.trim() || !description.trim()) {
      setError(getTranslation('stepDescription.error.bothFieldsRequired', language));
      return;
    }

    if (presentation.length > PRESENTATION_LIMIT) {
      setError(getTranslation('stepDescription.error.presentationTooLong', language));
      return;
    }

    if (description.length > DESCRIPTION_LIMIT) {
      setError(getTranslation('stepDescription.error.descriptionTooLong', language));
      return;
    }

    await withLoading(async () => {
      try {
        // Call createDescription API
        const response = await activitiesApi.createDescription({
          id: activityId!,
          presentation: presentation.trim(),
          description: description.trim(),
          lang: language
        });

        if (response.success) {
          // Navigate to next step (StepRecommendation)
          navigate('/extranet/activity/createRecommendation');
        } else {
          setError(response.message || getTranslation('stepDescription.error.saveFailed', language));
        }
      } catch (error) {
        console.error('Error saving description:', error);
        setError(getTranslation('stepDescription.error.saveFailed', language));
      }
    }, 'save-loading');
  };

  const handleBack = () => {
    navigate('/extranet/activity/createTitle');
  };

  return (
    <ActivityCreationLayout totalSteps={10}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header */}
          <div className="mb-5">
            <h1 className="h3 fw-bold text-primary mb-3">
              {getTranslation('stepDescription.title', language)}
            </h1>
            <p className="text-muted">
              {getTranslation('stepDescription.description', language)}
            </p>
          </div>

          {/* Formulario */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {/* Presentación del producto */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <h6 className="fw-bold mb-0">
                    {getTranslation('stepDescription.presentation.label', language)}
                  </h6>
                  <i className="fas fa-question-circle text-primary ms-2"></i>
                </div>
                <p className="text-muted small mb-3">
                  {getTranslation('stepDescription.presentation.instructions', language)}
                </p>
                <div className="position-relative">
                  <textarea
                    className="form-control"
                    rows={4}
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    placeholder={getTranslation('stepDescription.presentation.placeholder', language)}
                    maxLength={PRESENTATION_LIMIT}
                  />
                  <div className="position-absolute bottom-0 end-0 mb-2 me-2">
                    <small className={`${presentation.length > PRESENTATION_LIMIT * 0.9 ? 'text-warning' : 'text-muted'}`}>
                      {presentation.length} / {PRESENTATION_LIMIT}
                    </small>
                  </div>
                </div>
              </div>

              {/* Descripción completa del producto */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <h6 className="fw-bold mb-0">
                    {getTranslation('stepDescription.fullDescription.label', language)}
                  </h6>
                  <i className="fas fa-question-circle text-primary ms-2"></i>
                </div>
                <p className="text-muted small mb-3">
                  {getTranslation('stepDescription.fullDescription.instructions', language)}
                </p>
                <div className="position-relative">
                  <textarea
                    className="form-control"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={getTranslation('stepDescription.fullDescription.placeholder', language)}
                    maxLength={DESCRIPTION_LIMIT}
                  />
                  <div className="position-absolute bottom-0 end-0 mb-2 me-2">
                    <small className={`${description.length > DESCRIPTION_LIMIT * 0.9 ? 'text-warning' : 'text-muted'}`}>
                      {description.length} / {DESCRIPTION_LIMIT}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Botones de navegación */}
          <div className="d-flex justify-content-between mt-4">
            <button 
              className="btn btn-outline-secondary" 
              onClick={handleBack}
            >
              <i className="fas fa-arrow-left me-2"></i>
              {getTranslation('common.back', language)}
            </button>
            
            <div>
              <button 
                className="btn btn-outline-primary me-2" 
                onClick={() => navigate('/extranet/dashboard')}
              >
                {getTranslation('stepDescription.saveAndExit', language)}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleContinue}
              >
                {getTranslation('common.continue', language)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ActivityCreationLayout>
  );
};

export default StepDescription;

