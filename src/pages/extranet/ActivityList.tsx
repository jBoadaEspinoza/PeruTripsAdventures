import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activitiesApi } from '../../api/activities';
import type { Activity } from '../../api/activities';
import ExtranetPage from '../../components/ExtranetPage';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getTranslation } from '../../utils/translations';
import { useExtranetLoading } from '../../hooks/useExtranetLoading';
import { useAppDispatch } from '../../redux/store';
import { resetActivityCreation } from '../../redux/activityCreationSlice';

const ExtranetActivities: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const { withLoading } = useExtranetLoading();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      await withLoading(async () => {
        setError(null);
        
        const response = await activitiesApi.search({
          page: currentPage - 1, // API uses 0-based indexing
          size: itemsPerPage,
          lang: language,
          currency: currency
        });

        if (response.success) {
          setActivities(response.data);
          setTotalPages(response.totalPages);
        } else {
          setError(getTranslation('activities.error.loading', language));
        }
      }, 'activities-loading');
    };

    fetchActivities();
  }, [currentPage, itemsPerPage, language, currency, withLoading]);

  // Filter activities based on search term, status, and test activities
  useEffect(() => {
    let filtered = activities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(activity => {
        switch (selectedStatus) {
          case 'activo':
            return activity.isActive;
          case 'en_proceso':
            return !activity.isActive;
          default:
            return true;
        }
      });
    }
    setFilteredActivities(filtered);
  }, [activities, searchTerm, selectedStatus]);

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm(getTranslation('activities.delete.confirm', language))) {
      try {
        // Here you would call the API to delete the activity
        
        // Remove from local state
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
        
        alert(getTranslation('activities.delete.success', language));
      } catch (error) {
        alert(getTranslation('activities.delete.error', language));
      }
    }
  };

  const getStatusBadge = (activity: Activity) => {
    if (!activity.isActive) {
      return (
        <span className="badge bg-warning rounded-pill">
          <i className="fas fa-clock me-1"></i>
          {getTranslation('activities.status.inProgress', language)}
        </span>
      );
    }
    
    return (
      <span className="badge bg-success rounded-pill">
        <i className="fas fa-check-circle me-1"></i>
        {getTranslation('activities.status.active', language)}
      </span>
    );
  };

  const getActivityImage = (activity: Activity) => {
    if (activity.images && activity.images.length > 0) {
      const coverImage = activity.images.find(img => img.isCover) || activity.images[0];
      return coverImage.imageUrl;
    }
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop';
  };

  const getActivityDuration = (activity: Activity) => {
    if (activity.bookingOptions && activity.bookingOptions.length > 0) {
      const option = activity.bookingOptions[0];
      const hours = option.durationHours;
      const minutes = option.durationMinutes;
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}min`;
      } else if (hours > 0) {
        return `${hours} ${getTranslation('activities.duration.hours', language)}`;
      } else if (minutes > 0) {
        return `${minutes} ${getTranslation('activities.duration.minutes', language)}`;
      }
    }
    return getTranslation('activities.duration.notSpecified', language);
  };

  const getActivityOrigin = (activity: Activity) => {
    if (activity.bookingOptions && activity.bookingOptions.length > 0) {
      return activity.bookingOptions[0].meetingPointCity ;
    }
    return getTranslation('activities.destination.notSpecified', language);
  };

  if (error) {
    return (
      <ExtranetPage title={getTranslation('activities.title', language)}>
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </ExtranetPage>
    );
  }

  return (
    <ExtranetPage title={getTranslation('activities.title', language)}>
      {/* Page Info */}
      <div className="mb-4">
        <p className="text-muted mb-0">
          {getTranslation('activities.total', language)}: {filteredActivities.length} {getTranslation('activities.count', language)}
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="d-flex justify-content-between flex-column flex-md-row">
        <div className="row align-items-center mb-4 w-100">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <label className="form-label fw-bold text-muted mb-2">{getTranslation('activities.filter.byActivity', language)}</label>
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
          
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold text-muted mb-2">{getTranslation('activities.filter.byStatus', language)}</label>
            <select 
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">{getTranslation('activities.filter.allStatuses', language)}</option>
              <option value="activo">{getTranslation('activities.status.active', language)}</option>
              <option value="en_proceso">{getTranslation('activities.status.inProgress', language)}</option>
            </select>
          </div>
        </div>
        <div className="text-end mb-3 mb-md-0 w-100 w-md-auto">
            <button 
              className="btn btn-primary"
              onClick={() => {
                // Reiniciar todos los valores del step antes de crear nueva actividad
                dispatch(resetActivityCreation());
                console.log('ActivityList: Valores del step reiniciados para nueva actividad');
                navigate('/extranet/activity/createCategory');
              }}
            >
              <i className="fas fa-plus me-2"></i>
              {getTranslation('activities.create.new', language)}
            </button>
        </div>
      </div>

      {/* Activities Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3 px-4">
                    <div className="d-flex align-items-center">
                      {getTranslation('activities.table.activity', language)}
                      <i className="fas fa-sort ms-2 text-muted"></i>
                    </div>
                  </th>
                  <th className="border-0 py-3 px-4 d-none d-md-table-cell">ID</th>
                  <th className="border-0 py-3 px-4 d-none d-md-table-cell">{getTranslation('activities.table.origin', language)}</th>
                  <th className="border-0 py-3 px-4">
                    <div className="d-flex align-items-center">
                      {getTranslation('activities.table.status', language)}
                      <i className="fas fa-sort ms-2 text-muted"></i>
                    </div>
                  </th>
                  <th className="border-0 py-3 px-4">{getTranslation('activities.table.action', language)}</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="text-muted">
                        <i className="fas fa-search fa-2x mb-3"></i>
                        <p>{getTranslation('activities.noResults', language)}</p>
                        {searchTerm && (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setSearchTerm('')}
                          >
                            {getTranslation('activities.clearFilters', language)}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center">
                          <img 
                            src={getActivityImage(activity)} 
                            alt={activity.title}
                            className="rounded me-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-1 fw-bold">{activity.title}</h6>
                            <div className="d-flex align-items-center mb-1">
                              <small className="text-muted me-2">
                                <i className="fas fa-clock me-1"></i>
                                {getActivityDuration(activity)}
                              </small>
                              <div className="d-flex align-items-center d-none d-md-flex">
                                {[...Array(5)].map((_, i) => (
                                  <i key={i} className="fas fa-star text-muted me-1"></i>
                                ))}
                                <span className="text-muted ms-2">{getTranslation('activities.noRatings', language)}</span>
                              </div>
                            </div>
                            <a href="#" className="text-decoration-none">
                              {getTranslation('activities.viewOnWebsite', language)} <i className="fas fa-external-link-alt ms-1"></i>
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 d-none d-md-table-cell">
                        <span className="text-muted">{activity.id}</span>
                      </td>
                      <td className="py-3 px-4 d-none d-md-table-cell">
                        <span className="badge bg-dark rounded-pill text-uppercase">
                          {getActivityOrigin(activity)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(activity)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="dropdown">
                          <button 
                            className="btn btn-outline-primary btn-sm dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            <span className="d-none d-md-inline">{getTranslation('activities.viewDetails', language)}</span>
                            <i className="fas fa-ellipsis-v d-md-none"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#">{getTranslation('activities.edit', language)}</a></li>
                            <li><a className="dropdown-item" href="#">{getTranslation('activities.duplicate', language)}</a></li>
                            <li>
                              <button 
                                className="dropdown-item text-danger" 
                                onClick={() => handleDeleteActivity(activity.id)}
                              >
                                {getTranslation('activities.delete', language)}
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4 flex-column flex-md-row">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <span className="text-muted me-3">{getTranslation('activities.pagination.show', language)}</span>
            <select 
              className="form-select form-select-sm" 
              style={{ width: 'auto' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-muted ms-3">{getTranslation('activities.pagination.itemsPerPage', language)}</span>
          </div>
          
          <nav aria-label={getTranslation('activities.pagination.navigation', language)}>
            <ul className="pagination pagination-sm mb-0">
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
      )}
    </ExtranetPage>
  );
};

export default ExtranetActivities; 