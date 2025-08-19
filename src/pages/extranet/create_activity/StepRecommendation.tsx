import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import ActivityCreationLayout from '../../../components/ActivityCreationLayout';
import { useExtranetLoading } from '../../../hooks/useExtranetLoading';
import { useAppSelector, useAppDispatch } from '../../../redux/store';
import { setCurrentStep } from '../../../redux/activityCreationSlice';
import { activitiesApi } from '../../../api/activities';

const StepRecommendation: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { withLoading } = useExtranetLoading();
  const dispatch = useAppDispatch();
  const [recommendations, setRecommendations] = useState<string[]>(['', '', '']); // Initialize with 3 empty fields
  const [error, setError] = useState<string | null>(null);

  // Obtener activityId y selectedCategory desde Redux
  const { activityId, selectedCategory } = useAppSelector(state => state.activityCreation);

  // Set current step when component mounts
  useEffect(() => {
    dispatch(setCurrentStep(4)); // StepRecommendation is step 4
  }, [dispatch]);

  useEffect(() => {
    // Verificar que tenemos activityId antes de continuar
    if (!activityId) {
      console.log('StepRecommendation: No se encontró activityId, redirigiendo a createCategory');
      navigate('/extranet/activity/createCategory');
    }
  }, [activityId, navigate]);

  // Log para debugging
  useEffect(() => {
    console.log('StepRecommendation - ActivityId:', activityId);
    console.log('StepRecommendation - SelectedCategory:', selectedCategory);
  }, [activityId, selectedCategory]);

  const addRecommendation = () => {
    setRecommendations([...recommendations, '']);
  };

  const removeRecommendation = (index: number) => {
    // Only allow removal if we have more than 3 recommendations
    if (recommendations.length > 3) {
      const newRecommendations = recommendations.filter((_, i) => i !== index);
      setRecommendations(newRecommendations);
    }
  };

  const updateRecommendation = (index: number, value: string) => {
    const newRecommendations = [...recommendations];
    newRecommendations[index] = value;
    setRecommendations(newRecommendations);
  };

  const handleContinue = async () => {
    const validRecommendations = recommendations.filter(rec => rec.trim().length > 0);
    
    if (validRecommendations.length < 3) {
      setError(getTranslation('stepRecommend.error.minimumThreeRequired', language));
      return;
    }

    await withLoading(async () => {
      try {
        // Call createRecommendations API
        const response = await activitiesApi.createRecommendations({
          id: activityId!,
          recommendations: validRecommendations,
          lang: language
        });

        if (response.success) {
          // Navigate to next step (StepRestriction)
          navigate('/extranet/activity/createRestrictions');
        } else {
          setError(response.message || getTranslation('stepRecommend.error.saveFailed', language));
        }
      } catch (error) {
        console.error('Error saving recommendations:', error);
        setError(getTranslation('stepRecommend.error.saveFailed', language));
      }
    }, 'save-loading');
  };

  const handleBack = () => {
    navigate('/extranet/activity/createDescription');
  };

  return (
    <ActivityCreationLayout totalSteps={10}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header */}
          <div className="mb-5">
            <h1 className="h3 fw-bold text-primary mb-3">
              {getTranslation('stepRecommend.title', language)}
            </h1>
            <p className="text-muted">
              {getTranslation('stepRecommend.description', language)}
            </p>
          </div>

          {/* Formulario */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {/* Recomendaciones */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <h6 className="fw-bold mb-0">
                    {getTranslation('stepRecommend.recommendations.label', language)}
                  </h6>
                  <i className="fas fa-question-circle text-primary ms-2"></i>
                </div>
                <p className="text-muted small mb-3">
                  {getTranslation('stepRecommend.recommendations.instructions', language)}
                </p>
                
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className={`form-control me-2 ${index < 3 && !recommendation.trim() ? 'border-warning' : ''}`}
                        value={recommendation}
                        onChange={(e) => updateRecommendation(index, e.target.value)}
                        placeholder={getTranslation('stepRecommend.recommendations.placeholder', language)}
                        maxLength={100}
                        required={index < 3}
                      />
                      {recommendations.length > 3 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeRecommendation(index)}
                          title={getTranslation('stepRecommend.removeRecommendation', language)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {recommendation.length} / 100
                      </small>
                      {index < 3 && (
                        <small className="text-warning">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {getTranslation('stepRecommend.required', language)}
                        </small>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={addRecommendation}
                >
                  <i className="fas fa-plus me-2"></i>
                  {getTranslation('stepRecommend.addRecommendation', language)}
                </button>
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
                {getTranslation('stepRecommend.saveAndExit', language)}
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

export default StepRecommendation;
