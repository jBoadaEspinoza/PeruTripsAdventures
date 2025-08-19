import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
export interface DestinationCardData {
  id: number;
  cityName: string;
  countryId: string;
  latitude: number;
  longitude: number;
  active: boolean;
  activityCount: number;
  imageUrl?: string;
}

export interface DestinationCardProps {
  destination: DestinationCardData;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  variant?: 'default' | 'compact';
  showDetailsButton?: boolean;
  detailsButtonText?: string;
  onDetailsClick?: (id: number) => void;
  className?: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  columns = 4,
  variant = 'default',
  showDetailsButton = true,
  detailsButtonText,
  onDetailsClick,
  className = ''
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const getColumnClass = () => {
    const columnMap: Record<number, string> = {
      1: 'col-12',
      2: 'col-md-6',
      3: 'col-md-6 col-lg-4',
      4: 'col-md-6 col-lg-3',
      6: 'col-md-4 col-lg-2',
      12: 'col-12'
    };
    return columnMap[columns] || 'col-md-6 col-lg-4';
  };

  const handleDetailsClick = () => {
    if (onDetailsClick) {
      onDetailsClick(destination.id);
    } else {
      // Navegar a la página de búsqueda con el destino seleccionado
      const params = new URLSearchParams();
      params.append('destination', destination.cityName);
      navigate(`/search?${params.toString()}`);
    }
  };

  const renderDefaultCard = () => (
    <div className={`card h-100 shadow-lg border-0 rounded-3 overflow-hidden position-relative hover-lift ${className}`}>
      <div className="position-relative">
        <img
          src={destination.imageUrl || `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop`}
          alt={getTranslation(`destination.${destination.cityName}`, language)}
          className="card-img-top"
          style={{ height: '220px', objectFit: 'cover' }}
        />
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-white text-dark shadow-sm fw-bold px-3 py-2">
            {destination.activityCount} actividades
          </span>
        </div>
        <div className="position-absolute bottom-0 start-0 m-3">
          <span className="badge bg-primary fw-bold px-3 py-2">
            {getTranslation(`destination.${destination.cityName}`, language)}
          </span>
        </div>
      </div>
      <div className="card-body d-flex flex-column p-4">
        <div className="mb-3">
          <h5 className="card-title fw-bold mb-2 text-dark" style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>
            {getTranslation(`destination.${destination.cityName}`, language)}
          </h5>
          <div className="d-flex align-items-center mb-2">
            <svg className="text-warning me-1" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="fw-medium me-1">4.8</span>
            <small className="text-muted">
              (Destino popular)
            </small>
          </div>
        </div>
        
        <div className="mt-auto pt-3">
          {showDetailsButton && (
            <button 
              className="btn btn-primary fw-bold px-4 py-2 rounded-pill w-100"
              onClick={handleDetailsClick}
            >
              {detailsButtonText || getTranslation('common.viewDetails', language)}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderCompactCard = () => (
    <div className={`card h-100 shadow-sm border-0 rounded-3 overflow-hidden ${className}`}>
      <div className="position-relative">
        <img
          src={destination.imageUrl || `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop`}
          alt={getTranslation(`destination.${destination.cityName}`, language)}
          className="card-img-top"
          style={{ height: '180px', objectFit: 'cover' }}
        />
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-white text-dark shadow-sm fw-bold px-2 py-1">
            {destination.activityCount}
          </span>
        </div>
      </div>
      <div className="card-body p-3">
        <div className="mb-2">
          <h6 className="card-title fw-bold mb-2" style={{ fontSize: '0.95rem' }}>
            {getTranslation(`destination.${destination.cityName}`, language)}
          </h6>
          <small className="text-muted">{destination.activityCount} actividades</small>
        </div>
        {showDetailsButton && (
          <button 
            className="btn btn-primary btn-sm w-100"
            onClick={handleDetailsClick}
          >
            {detailsButtonText || 'Ver'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={getColumnClass()}>
      {variant === 'compact' && renderCompactCard()}
      {variant === 'default' && renderDefaultCard()}
    </div>
  );
};

export default DestinationCard; 