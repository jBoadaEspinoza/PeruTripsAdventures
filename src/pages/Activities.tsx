import React, { useState, useEffect } from 'react';
import { activitiesApi } from '../api/activities';
import type { Activity, SearchParams } from '../api/activities';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { getTranslation } from '../utils/translations';
import ActivityGrid from '../components/ActivityGrid';
import type { ActivityCardData } from '../components/ActivityCard';

const Activities: React.FC = () => {
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [destinations, setDestinations] = useState<string[]>([]);

  // Fetch destinations for filter
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await activitiesApi.getDestinations();
        if (response.success) {
          setDestinations(response.data.map(dest => dest.cityName));
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiSearchParams: SearchParams = {
          companyId: '10430391564',
          page: currentPage - 1,
          size: itemsPerPage,
          lang: language,
          currency: currency
        };

        const response = await activitiesApi.search(apiSearchParams);

        if (response.success) {
          setActivities(response.data);
          setTotalPages(response.totalPages);
        } else {
          setError(getTranslation('activities.error.loading', language));
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(getTranslation('activities.error.loading', language));
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [currentPage, language, currency]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    
    const fetchFilteredActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiSearchParams: SearchParams = {
          companyId: '10430391564',
          page: 0, // Reset to first page
          size: itemsPerPage,
          lang: language,
          currency: currency
        };

        // Add search term if provided
        if (searchTerm.trim()) {
          apiSearchParams.searchTerm = searchTerm.trim();
        }

        // Add destination filter if selected
        if (selectedDestination) {
          apiSearchParams.destinationCity = selectedDestination;
        }

        const response = await activitiesApi.search(apiSearchParams);

        if (response.success) {
          setActivities(response.data);
          setTotalPages(response.totalPages);
        } else {
          setError(getTranslation('activities.error.loading', language));
        }
      } catch (err) {
        console.error('Error searching activities:', err);
        setError(getTranslation('activities.error.loading', language));
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredActivities();
  };

  const handleDestinationChange = (destination: string) => {
    setSelectedDestination(destination);
    // No ejecutar búsqueda automáticamente, solo actualizar el estado
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDestination('');
    setCurrentPage(1);
    
    // Ejecutar búsqueda sin filtros
    const fetchAllActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiSearchParams: SearchParams = {
          companyId: '10430391564',
          page: 0,
          size: itemsPerPage,
          lang: language,
          currency: currency
        };

        const response = await activitiesApi.search(apiSearchParams);

        if (response.success) {
          setActivities(response.data);
          setTotalPages(response.totalPages);
        } else {
          setError(getTranslation('activities.error.loading', language));
        }
      } catch (error) {
        console.error('Error clearing filters:', error);
        setError(getTranslation('activities.error.loading', language));
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  };

  const convertToActivityCardData = (activity: Activity): ActivityCardData => {
    return {
      id: activity.id,
      title: activity.title,
      description: activity.presentation || '',
      imageUrl: activity.images && activity.images.length > 0 
        ? activity.images.find(img => img.isCover)?.imageUrl || activity.images[0].imageUrl
        : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      price: activity.bookingOptions && activity.bookingOptions.length > 0
        ? activity.bookingOptions[0].pricePerPerson
        : 0,
      duration: activity.bookingOptions && activity.bookingOptions.length > 0
        ? `${activity.bookingOptions[0].durationHours}h ${activity.bookingOptions[0].durationMinutes}min`
        : getTranslation('activities.duration.notSpecified', language),
      destination: activity.bookingOptions && activity.bookingOptions.length > 0
        ? activity.bookingOptions[0].meetingPointCity
        : getTranslation('activities.destination.notSpecified', language),
      rating: 0, // Placeholder for rating
      reviewCount: 0, // Placeholder for review count
      includes: activity.includes || [] // Agregar includes para mostrar en badges
    };
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{getTranslation('common.loading', language)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-5 fw-bold text-primary mb-3">
            {getTranslation('activities.title', language)}
          </h1>
          <p className="lead text-muted">
            {getTranslation('activities.subtitle', language)}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder={getTranslation('activities.search.placeholder', language)}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={selectedDestination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                    >
                      <option value="">{getTranslation('activities.filter.allDestinations', language)}</option>
                      {destinations.map((destination) => (
                        <option key={destination} value={destination}>
                          {destination}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button type="submit" className="btn btn-primary w-100">
                      <i className="fas fa-search me-2"></i>
                      {getTranslation('activities.search.button', language)}
                    </button>
                  </div>
                </div>
              </form>
              
              {(searchTerm || selectedDestination) && (
                <div className="mt-3">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearFilters}
                  >
                    <i className="fas fa-times me-2"></i>
                    {getTranslation('activities.clearFilters', language)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="row mb-4">
        <div className="col-12">
          <p className="text-muted mb-0">
            {getTranslation('activities.total', language)}: {activities.length} {getTranslation('activities.count', language)}
          </p>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="row mb-4">
        <div className="col-12">
          <ActivityGrid activities={activities.map(convertToActivityCardData)} />
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="row">
          <div className="col-12">
            <nav aria-label={getTranslation('activities.pagination.navigation', language)}>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>
                </li>
                
                {(() => {
                  const startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, currentPage + 2);
                  const pages = [];
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </button>
                      </li>
                    );
                  }
                  
                  return pages;
                })()}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities; 