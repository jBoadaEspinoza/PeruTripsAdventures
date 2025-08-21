import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import OptionSetupLayout from '../../../components/OptionSetupLayout';
import { useAppSelector } from '../../../redux/store';

export default function StepOptionAvailabilityPrice() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activityId } = useAppSelector(state => state.activityCreation);
  
  const optionId = searchParams.get('optionId');

  useEffect(() => {
    if (!optionId) {
      navigate('/extranet/activity/createOptionSettings');
      return;
    }
  }, [optionId, navigate]);

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
                {/* Header con título */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h5 className="fw-bold text-primary mb-0">
                    {getTranslation('stepAvailabilityPricing.title', language)}
                  </h5>
                </div>

                {/* Contenido de la página */}
                <div className="text-center py-5">
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <h6 className="alert-heading">Página en desarrollo</h6>
                    <p className="mb-0">
                      {language === 'es' 
                        ? 'Esta página está en desarrollo. Aquí se configurará la disponibilidad y precios de la opción de reserva.'
                        : 'This page is under development. Here you will configure the availability and pricing of the booking option.'
                      }
                    </p>
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="d-flex justify-content-between mt-5">
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/extranet/activity/createOptionMeetingPickup')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    {getTranslation('stepAvailabilityPricing.buttons.back', language)}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => navigate('/extranet/activity/createOptionTimeLimit')}
                  >
                    {getTranslation('stepAvailabilityPricing.buttons.continue', language)}
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
