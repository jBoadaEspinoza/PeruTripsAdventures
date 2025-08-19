import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import ActivityCreationLayout from '../../../components/ActivityCreationLayout';
import { useExtranetLoading } from '../../../hooks/useExtranetLoading';
import { useAppSelector, useAppDispatch } from '../../../redux/store';
import { setCurrentStep } from '../../../redux/activityCreationSlice';
import { activitiesApi } from '../../../api/activities';

const StepNotInclude: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { withLoading } = useExtranetLoading();
  const dispatch = useAppDispatch();
  const [exclusions, setExclusions] = useState<string[]>(['']); // Initialize with 1 empty field
  const [error, setError] = useState<string | null>(null);

  // Obtener activityId y selectedCategory desde Redux
  const { activityId, selectedCategory } = useAppSelector(state => state.activityCreation);

  // Set current step when component mounts
  useEffect(() => {
    dispatch(setCurrentStep(7)); // StepNotInclude is step 7
  }, [dispatch]);

  useEffect(() => {
    // Verificar que tenemos activityId antes de continuar
    if (!activityId) {
      console.log('StepNotInclude: No se encontró activityId, redirigiendo a createCategory');
      navigate('/extranet/activity/createCategory');
    }
  }, [activityId, navigate]);

  // Log para debugging
  useEffect(() => {
    console.log('StepNotInclude - ActivityId:', activityId);
    console.log('StepNotInclude - SelectedCategory:', selectedCategory);
  }, [activityId, selectedCategory]);

  const addExclusion = () => {
    setExclusions([...exclusions, '']);
  };

  const removeExclusion = (index: number) => {
    // Only allow removal if we have more than 1 exclusion
    if (exclusions.length > 1) {
      const newExclusions = exclusions.filter((_, i) => i !== index);
      setExclusions(newExclusions);
    }
  };

  const updateExclusion = (index: number, value: string) => {
    const newExclusions = [...exclusions];
    newExclusions[index] = value;
    setExclusions(newExclusions);
  };

  const handleContinue = async () => {
    const validExclusions = exclusions.filter(exc => exc.trim().length > 0);
    
    // Since this step is optional, we can continue even with no exclusions
    // But if the user has added some, they should be valid
    if (validExclusions.length === 0) {
      // No exclusions added, continue to next step
      navigate('/extranet/activity/createImages');
      return;
    }

    await withLoading(async () => {
      try {
        // Call createNotIncludes API
        const response = await activitiesApi.createNotIncludes({
          id: activityId!,
          notInclusions: validExclusions,
          lang: language
        });

        if (response.success) {
          // Navigate to next step (StepImages)
          navigate('/extranet/activity/createImages');
        } else {
          setError(response.message || getTranslation('stepNotInclude.error.saveFailed', language));
        }
      } catch (error) {
        console.error('Error saving exclusions:', error);
        setError(getTranslation('stepNotInclude.error.saveFailed', language));
      }
    }, 'save-loading');
  };

  const handleBack = () => {
    navigate('/extranet/activity/createInclude');
  };

  return (
    <ActivityCreationLayout totalSteps={10}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header */}
          <div className="mb-5">
            <h1 className="h3 fw-bold text-primary mb-3">
              {getTranslation('stepNotInclude.title', language)}
            </h1>
            <p className="text-muted">
              {getTranslation('stepNotInclude.description', language)}
            </p>
          </div>

          {/* Formulario */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {/* Exclusiones */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <h6 className="fw-bold mb-0">
                    {getTranslation('stepNotInclude.exclusions.label', language)}
                  </h6>
                  <i className="fas fa-question-circle text-primary ms-2"></i>
                </div>
                <p className="text-muted small mb-3">
                  {getTranslation('stepNotInclude.exclusions.instructions', language)}
                </p>
                
                {exclusions.map((exclusion, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className="form-control me-2"
                        value={exclusion}
                        onChange={(e) => updateExclusion(index, e.target.value)}
                        placeholder={getTranslation('stepNotInclude.exclusions.placeholder', language)}
                        maxLength={100}
                      />
                      {exclusions.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeExclusion(index)}
                          title={getTranslation('stepNotInclude.removeExclusion', language)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {exclusion.length} / 100
                      </small>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={addExclusion}
                >
                  <i className="fas fa-plus me-2"></i>
                  {getTranslation('stepNotInclude.addExclusion', language)}
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
                {getTranslation('stepNotInclude.saveAndExit', language)}
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

export default StepNotInclude;
