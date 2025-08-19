import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';
import { useConfig } from '../context/ConfigContext';
import ActivityGrid from '../components/ActivityGrid';
import type { ActivityCardData } from '../components/ActivityCard';
import DestinationGrid from '../components/DestinationGrid';
import type { DestinationCardData } from '../components/DestinationCard';
import { activitiesApi } from '../api/activities';
import type { Destination } from '../api/activities';


const Home: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { config } = useConfig();

  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isTravelersDropdownOpen, setIsTravelersDropdownOpen] = useState(false);
  const travelersDropdownRef = useRef<HTMLDivElement>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDateTooltip, setShowDateTooltip] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = config.business.website;
  }, [config.business.website]);

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoadingDestinations(true);
        setError(null);
        const response = await activitiesApi.getDestinations();
        
        if (!response.success || !response.data || response.data.length === 0) {
          setError('No se encontraron destinos disponibles en este momento.');
          setDestinations([]);
        } else {
          setDestinations(response.data);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setError('Error al cargar los destinos. Por favor, inténtelo de nuevo.');
        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, []);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (travelersDropdownRef.current && !travelersDropdownRef.current.contains(event.target as Node)) {
        setIsTravelersDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAdultsChange = (increment: boolean) => {
    if (increment) {
      setAdults(prev => prev + 1);
    } else {
      setAdults(prev => Math.max(1, prev - 1));
    }
  };

  const handleChildrenChange = (increment: boolean) => {
    if (increment) {
      setChildren(prev => prev + 1);
    } else {
      setChildren(prev => Math.max(0, prev - 1));
    }
  };

  const handleSearch = () => {
    // Validar que se haya seleccionado una fecha
    if (!dates) {
      setShowDateTooltip(true);
      // Ocultar el tooltip después de 3 segundos
      setTimeout(() => setShowDateTooltip(false), 3000);
      return;
    }

    const params = new URLSearchParams();
    if (destination) params.append('destination', destination);
    if (dates) params.append('date', dates);
    params.append('adults', adults.toString());
    params.append('children', children.toString());
    
    navigate(`/search?${params.toString()}`);
  };

  const getTravelersText = () => {
    const total = adults + children;
    if (total === 1) return `1 ${getTranslation('home.search.travelers', language).toLowerCase()}`;
    return `${total} ${getTranslation('home.search.travelers', language).toLowerCase()}`;
  };

  const features = [
    {
      icon: (
        <svg className="text-warning" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      title: 'Especialistas en Costa Sur',
      description: 'Más de 10 años de experiencia en Paracas, Ica y Nazca'
    },
    {
      icon: (
        <svg className="text-primary" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      title: 'Guías Certificados',
      description: 'Expertos locales en arqueología, naturaleza y gastronomía'
    },
    {
      icon: (
        <svg className="text-success" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Destinos Únicos',
      description: 'Líneas de Nazca, Islas Ballestas, Huacachina y más'
    },
    {
      icon: (
        <svg className="text-info" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Flexibilidad Total',
      description: 'Cancelación gratuita hasta 24h antes del viaje'
    }
  ];

  const stats = [
    { number: '8,000+', label: 'Viajeros Satisfechos' },
    { number: '15+', label: 'Actividades Especializadas' },
    { number: '99%', label: 'Tasa de Satisfacción' },
    { number: '24/7', label: 'Soporte en Español' }
  ];

  return (
    <div className="min-vh-100 bg-white">
      {/* Hero Section con Buscador */}
      <div 
        className="position-relative text-white py-5"
        style={{
          backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/gestionafacil-92adb.firebasestorage.app/o/catalogs%2Fservices%2F1753995672651.jpg?alt=media&token=2941bfdb-3723-413b-8c12-6335eb4ece82)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh'
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
        
        <div className="container position-relative py-5">
          <div className="text-center mb-5">
            <h1 className="display-3 fw-bold mb-4">
              {getTranslation('home.hero.title', language)}
            </h1>
            <p className="lead mb-4">
              {getTranslation('home.hero.subtitle', language)}
            </p>
          </div>

          {/* Buscador Principal */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Destino */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        {getTranslation('home.search.where', language)}
                      </label>
                      <div className="position-relative">
                        <svg className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <select
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="form-select ps-5"
                          disabled={loadingDestinations}
                        >
                          <option value="">
                            {loadingDestinations ? getTranslation('common.loading', language) : getTranslation('home.search.where', language)}
                          </option>
                          {destinations.map((dest) => (
                            <option key={dest.id} value={dest.cityName}>
                              {getTranslation(`destination.${dest.cityName}`, language)} ({dest.activityCount} actividades)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Fecha */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        {getTranslation('home.search.date', language)}
                      </label>
                      <div className="position-relative">
                        <svg className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <input
                          type="date"
                          value={dates}
                          onChange={(e) => {
                            setDates(e.target.value);
                            // Ocultar tooltip cuando se selecciona una fecha
                            if (e.target.value) {
                              setShowDateTooltip(false);
                            }
                          }}
                          onFocus={() => setShowDateTooltip(false)}
                          className={`form-control ps-5 ${showDateTooltip ? 'border-danger' : ''}`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {/* Tooltip de error */}
                        {showDateTooltip && (
                          <div className="position-absolute top-100 start-0 mt-1 p-2 bg-danger text-white rounded shadow-sm" style={{ zIndex: 1000, fontSize: '0.875rem' }}>
                            <div className="d-flex align-items-center">
                              <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Seleccione fecha de salida
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Viajeros - Selector desplegable */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold">
                        {getTranslation('home.search.travelers', language)}
                      </label>
                      <div className="position-relative" ref={travelersDropdownRef}>
                        <button
                          type="button"
                          className="form-select text-start d-flex align-items-center justify-content-between"
                          onClick={() => setIsTravelersDropdownOpen(!isTravelersDropdownOpen)}
                        >
                          <div className="d-flex align-items-center">
                            <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                            <span>{getTravelersText()}</span>
                          </div>
                        </button>
                        
                        {/* Dropdown de viajeros */}
                        {isTravelersDropdownOpen && (
                          <div className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded shadow-lg p-3 z-3">
                            {/* Adultos */}
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label fw-bold mb-0">{getTranslation('home.search.adults', language)}</label>
                                <small className="text-muted">18+ años</small>
                              </div>
                              <div className="d-flex align-items-center">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleAdultsChange(false)}
                                  disabled={adults <= 1}
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                                  </svg>
                                </button>
                                <span className="mx-3 fw-bold" style={{ minWidth: '30px', textAlign: 'center' }}>
                                  {adults}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleAdultsChange(true)}
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {/* Niños */}
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label fw-bold mb-0">{getTranslation('home.search.children', language)}</label>
                                <small className="text-muted">0-17 años</small>
                              </div>
                              <div className="d-flex align-items-center">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleChildrenChange(false)}
                                  disabled={children <= 0}
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                                  </svg>
                                </button>
                                <span className="mx-3 fw-bold" style={{ minWidth: '30px', textAlign: 'center' }}>
                                  {children}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleChildrenChange(true)}
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      className="btn btn-primary btn-lg w-100"
                      onClick={handleSearch}
                    >
                      <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      {getTranslation('home.search.button', language)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="row g-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-6 col-md-3 text-center">
                <div className="h2 fw-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted fw-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

                    {/* Destinos Destacados */}
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              {getTranslation('home.destinations.title', language)}
            </h2>
            <p className="lead text-muted">
              {getTranslation('home.destinations.subtitle', language)}
            </p>
          </div>

          {/* Alert de error */}
          {error && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Solo mostrar el grid si no hay error y hay destinos */}
          {!error && destinations.length > 0 && (
            <DestinationGrid
              destinations={destinations.map(destination => ({
                id: destination.id,
                cityName: destination.cityName,
                countryId: destination.countryId,
                latitude: destination.latitude,
                longitude: destination.longitude,
                active: destination.active,
                activityCount: destination.activityCount,
                imageUrl: destination.imageUrl
              }))}
              columns={3}
              variant="default"
              showDetailsButton={true}
              detailsButtonText={getTranslation('home.destinations.viewActivities', language)}
              onDetailsClick={(id) => {
                // Navegar a la página de búsqueda con el destino seleccionado
                const selectedDest = destinations.find(d => d.id === id);
                if (selectedDest) {
                  const params = new URLSearchParams();
                  params.append('destination', selectedDest.cityName);
                  if (dates) params.append('date', dates);
                  params.append('adults', adults.toString());
                  params.append('children', children.toString());
                  
                  navigate(`/search?${params.toString()}`);
                }
              }}
              loading={loadingDestinations}
            />
          )}

          {/* Mensaje cuando no hay destinos */}
          {!loadingDestinations && !error && destinations.length === 0 && (
            <div className="text-center py-5">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                No hay destinos disponibles en este momento.
              </div>
            </div>
          )}
        </div>

      {/* Características */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              ¿Por qué elegirnos?
            </h2>
            <p className="lead text-muted">
              Especialistas en la Costa Sur de Perú
            </p>
          </div>

          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3 text-center">
                <div className="mb-3">
                  {feature.icon}
                </div>
                <h5 className="fw-bold mb-2">
                  {feature.title}
                </h5>
                <p className="text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">
            ¿Listo para explorar la Costa Sur?
          </h2>
          <p className="lead mb-4">
            Únete a más de 8,000 viajeros que ya han descubierto Paracas, Ica y Nazca
          </p>
          <button className="btn btn-light btn-lg">
            Explorar Todas las Actividades
          </button>
        </div>
      </div>

           </div>
   );
 };

export default Home; 