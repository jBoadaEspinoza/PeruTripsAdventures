import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { activitiesApi } from '../api/activities';
import type { Activity, SearchParams, Destination } from '../api/activities';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { getTranslation, getTranslationWithParams } from '../utils/translations';
import ActivityGrid from '../components/ActivityGrid';
import type { ActivityCardData } from '../components/ActivityCard';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const [searchParams] = useSearchParams();
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const itemsPerPage = 10;

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoadingDestinations(true);
        const response = await activitiesApi.getDestinations();
        setDestinations(response.data);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        // Fallback to static destinations if API fails
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const destination = searchParams.get('destination') || '';
        const date = searchParams.get('date') || '';
        const adultsParam = searchParams.get('adults') || '1';
        const childrenParam = searchParams.get('children') || '0';

        setSelectedDestination(destination);
        setSelectedDate(date);
        setAdults(parseInt(adultsParam));
        setChildren(parseInt(childrenParam));

        const apiSearchParams: SearchParams = {
          destinationCity: destination || undefined,
          lang: language,
          companyId: '10430391564',
          page: currentPage - 1, // API usa 0-based indexing
          size: itemsPerPage,
          currency: currency
        };

        const response = await activitiesApi.search(apiSearchParams);
        setActivities(response.data || []);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(getTranslation('search.error.loading', language));
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [searchParams, currentPage, language, currency]);

  const handleDestinationChange = (destination: string) => {
    setSelectedDestination(destination);
    setCurrentPage(1); // Resetear a la primera página
    
    // Actualizar URL con el nuevo destino
    const newSearchParams = new URLSearchParams(searchParams);
    if (destination) {
      newSearchParams.set('destination', destination);
    } else {
      newSearchParams.delete('destination');
    }
    navigate(`/search?${newSearchParams.toString()}`);
  };

  const getDestinationLabel = (destination: string) => {
    if (!destination) return getTranslation('search.filters.allDestinations', language);
    const dest = destinations.find(d => d.cityName === destination);
    return dest ? `${getTranslation(`destination.${dest.cityName}`, language)} (${dest.activityCount} actividades)` : destination;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-3">
              {getTranslation('search.title', language)}
            </h1>
            <p className="lead">
              {getTranslationWithParams('search.found', language, { count: totalElements })}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Resumen de Búsqueda */}
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-3">
            {/* Filtros */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white">
                <h5 className="fw-bold mb-0">{getTranslation('search.filters.title', language)}</h5>
              </div>
              <div className="card-body">
                {/* Destino */}
                <div className="mb-3">
                  <label className="form-label fw-bold">{getTranslation('search.filters.destination', language)}</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="form-select"
                    disabled={loadingDestinations}
                  >
                    <option value="">
                      {loadingDestinations ? getTranslation('common.loading', language) : getTranslation('search.filters.allDestinations', language)}
                    </option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.cityName}>
                        {getTranslation(`destination.${dest.cityName}`, language)} ({dest.activityCount} actividades)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resumen de búsqueda */}
                <div className="mb-3">
                  <label className="form-label fw-bold">{getTranslation('search.filters.yourSearch', language)}</label>
                  <div className="small text-muted">
                    <div>{getTranslation('search.filters.destination', language)}: {getDestinationLabel(selectedDestination)}</div>
                    {selectedDate && <div>{getTranslation('search.filters.date', language)}: {selectedDate}</div>}
                    <div>{getTranslation('search.filters.travelers', language)}: {adults} {getTranslation('search.filters.adults', language)}, {children} {getTranslation('search.filters.children', language)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Actividades */}
          <div className="col-lg-9">
            {/* Lista de Actividades - 1 por columna */}
            <div className="row g-4">
              {loading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{getTranslation('common.loading', language)}</span>
                  </div>
                  <p className="mt-3">{getTranslation('search.loading', language)}</p>
                </div>
              ) : error ? (
                <div className="col-12 text-center py-5">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                </div>
              ) : (
                                 <ActivityGrid
                   activities={(activities || []).map((activity) => {
                     const coverImage = activity.images.find(img => img.isCover)?.imageUrl || activity.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
                     const duration = activity.bookingOptions[0] ? `${activity.bookingOptions[0].durationHours}h ${activity.bookingOptions[0].durationMinutes > 0 ? `${activity.bookingOptions[0].durationMinutes}min` : ''}` : '1 día';
                     
                     console.log('Transforming activity:', {
                       id: activity.id,
                       title: activity.title,
                       bookingOptions: activity.bookingOptions,
                       bookingOptionsLength: activity.bookingOptions?.length || 0
                     });
                     
                     return {
                       id: activity.id,
                       title: activity.title,
                       image: coverImage,
                       price: 0, // El precio se calculará dinámicamente desde bookingOptions
                       duration: duration,
                       category: activity.categoryName, // Usar categoryName como category
                       presentation: activity.presentation,
                       rating: 4.5, // Valor por defecto ya que no viene en la API
                       reviews: 150, // Valor por defecto ya que no viene en la API
                       includes: activity.includes,
                       bookingOptions: activity.bookingOptions, // Pasar las opciones de booking
                       currency: activity.bookingOptions[0]?.currency || 'PEN',
                       pricingMode: 'PER_PERSON' as const
                     };
                   })}
                  columns={1}
                  variant="horizontal"
                  showDetailsButton={true}
                  detailsButtonText={getTranslation('search.viewDetails', language)}
                  emptyMessage={getTranslation('search.noResults', language)}
                  loading={loading}
                />
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <nav aria-label="Paginación de resultados">
                  <ul className="pagination">
                    {/* Botón Anterior */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        {getTranslation('common.previous', language)}
                      </button>
                    </li>

                    {/* Números de página */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    {/* Botón Siguiente */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        {getTranslation('common.next', language)}
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 