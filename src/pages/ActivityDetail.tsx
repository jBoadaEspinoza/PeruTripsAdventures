import React, { useState, useEffect } from 'react';

// Declaración de tipos para lightGallery
declare global {
  interface Window {
    lightGallery: any;
  }
}
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { activitiesApi } from '../api/activities';
import type { Activity } from '../api/activities';
import Itinerary from '../components/Itinerary';
import Reviews from '../components/Reviews';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { getTranslation } from '../utils/translations';
import { useGlobalLoading } from '../hooks/useGlobalLoading';

interface Review {
  id: string;
  user: {
    name: string;
    country: string;
    initial: string;
    avatarColor: string;
  };
  rating: number;
  date: string;
  verified: boolean;
  text: string;
  images?: string[];
}

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const { withLoading } = useGlobalLoading();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [showBookingOptions, setShowBookingOptions] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [selectedMeetingPoints, setSelectedMeetingPoints] = useState<{ [key: string]: string }>({});
  const [hotelSearchResults, setHotelSearchResults] = useState<{ [key: string]: any[] }>({});
  
  // Obtener fecha seleccionada desde la URL
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date');

  // Función para filtrar horarios por fecha seleccionada
  const getSchedulesForSelectedDate = (schedules: any[]) => {
    if (!selectedDate) return schedules; // Si no hay fecha seleccionada, mostrar todos
    
    const selectedDayOfWeek = new Date(selectedDate).getDay(); // 0 = Domingo, 1 = Lunes, etc.
    return schedules.filter(schedule => schedule.dayOfWeek === selectedDayOfWeek);
  };

  // Función para hacer scroll a la sección de booking options
  const scrollToBookingOptions = () => {
    const bookingOptionsSection = document.getElementById('booking-options-section');
    if (bookingOptionsSection) {
      bookingOptionsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Función para manejar selección de idiomas (múltiple)
  const handleLanguageSelection = (lang: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        return prev.filter(l => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  // Función para manejar selección de horario (único)
  const handleScheduleSelection = (scheduleId: string) => {
    setSelectedSchedule(prev => prev === scheduleId ? null : scheduleId);
  };

  // Función para manejar selección de punto de encuentro
  const handleMeetingPointSelection = (optionTitle: string, meetingPoint: string) => {
    setSelectedMeetingPoints(prev => ({
      ...prev,
      [optionTitle]: meetingPoint
    }));
  };

  // Función para manejar búsqueda de hotel
  const handleHotelSearch = (optionTitle: string, searchTerm: string) => {
    // Aquí se implementaría la integración con Google Maps API
    // Por ahora simulamos resultados
    const mockResults = [
      { name: 'Hotel Plaza Mayor', address: 'Plaza Mayor, Lima' },
      { name: 'Hotel Miraflores', address: 'Av. Arequipa, Miraflores' },
      { name: 'Hotel San Isidro', address: 'Av. Javier Prado, San Isidro' }
    ].filter(hotel => 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setHotelSearchResults(prev => ({
      ...prev,
      [optionTitle]: mockResults
    }));
  };

  // Función para obtener precio mínimo y currency
  const getMinPrice = () => {
    if (!activity?.bookingOptions || activity.bookingOptions.length === 0) return { price: null, currency: 'USD' };
    
    const activeOptions = activity.bookingOptions.filter(option => option.isActive);
    if (activeOptions.length === 0) return { price: null, currency: 'USD' };
    
    let minPrice = Infinity;
    let minCurrency = 'USD';
    let minOption = null;
    
    activeOptions.forEach(option => {
      let optionMinPrice = Infinity;
      
      // Si el pricingMode es PER_PERSON, obtener el precio desde priceTiers
      if (option.pricingMode === 'PER_PERSON' && option.priceTiers && option.priceTiers.length > 0) {
        optionMinPrice = Math.min(...option.priceTiers.map(tier => tier.pricePerParticipant));
      } else {
        // Para otros modos de pricing, usar pricePerPerson directamente
        optionMinPrice = option.pricePerPerson;
      }
      
      if (optionMinPrice < minPrice) {
        minPrice = optionMinPrice;
        minCurrency = option.currency;
        minOption = option;
      }
    });
    
    return { 
      price: minPrice === Infinity ? null : minPrice, 
      currency: minCurrency 
    };
  };

  // Inicializar lightGallery cuando las imágenes estén disponibles
  useEffect(() => {
    if (activity?.images && activity.images.length > 0) {
      const galleryElement = document.getElementById('activity-gallery');
      if (galleryElement && window.lightGallery) {
        // Destruir galería anterior si existe
        const existingGallery = galleryElement.querySelector('.lg-backdrop');
        if (existingGallery) {
          existingGallery.remove();
        }
        
        // Inicializar nueva galería con transición fade
        window.lightGallery(galleryElement, {
          mode: 'lg-fade',
          speed: 500,
          easing: 'ease-in-out'
        });
      }
    }
  }, [activity]);

  

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      try {
        await withLoading(async () => {
          setError(null);
          const activityData = await activitiesApi.getById(id, language, currency);
          setActivity(activityData);
        }, 'activity-detail');
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar la actividad');
      }
    };

    fetchActivity();
  }, [id, language, currency, withLoading]);



  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            {getTranslation('common.back', language)}
          </button>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>{getTranslation('detail.notFound', language)}</h2>
          <p>ID: {id}</p>
          <p>Language: {language}</p>
          <p>Currency: {currency}</p>
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            {getTranslation('common.back', language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">
        {/* Title and Rating Section */}
        <div className="row mb-4">
          <div className="col-lg-12">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="flex-grow-1">
                <h1 className="h2 fw-bold text-dark mb-2 font-montserrat" style={{ 
                   color: '#1a365d',
                   fontWeight: 800
                 }}>{activity.title}</h1>
                {activity.rating && (<div className="d-flex align-items-center mb-2">
                  <div className="d-flex align-items-center me-3">
                    <svg className="text-warning me-1" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="fw-medium me-1">4.8</span>
                    <small className="text-muted">(150 {getTranslation('detail.reviews', language)})</small>
                  </div>
                </div>)}
              </div>
            </div>
          </div>
        </div>
         {/* Image Gallery Section */}
         {activity.images && activity.images.length > 0 && (
           <div className="row mb-5">
              <div className="col-12">
                              <div id="activity-gallery" className="activity-gallery">
                   {activity.images.map((image, index) => (
                  <a
                    key={index}
                    href={image.imageUrl}
                    className="gallery-item"
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${activity.title} - Imagen ${index + 1}`}
                      className="img-fluid rounded"
                    />
                    <div className="image-overlay">
                      <i className="fas fa-expand-alt"></i>
                    </div>
                  </a>
                ))}
               </div>
              </div>
            </div>
         )}

         {/* Contenido Principal */}
         <div className="row">
            <div className="col-lg-8">
              {/* Descripción */}
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-3">{getTranslation('detail.description', language)}</h4>
                  {activity.description.map((paragraph, index) => (
                    <p key={index} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>
              {/* Incluye */}
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-3">{getTranslation('detail.includes', language)}</h4>
                  <ul className="list-unstyled">
                    {activity.includes.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* No incluye */}
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-3">{getTranslation('detail.notIncludes', language)}</h4>
                  <ul className="list-unstyled">
                    {activity.notIncludes.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="fas fa-times text-danger me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Recomendaciones */}
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-3">{getTranslation('detail.recommendations', language)}</h4>
                  <ul className="list-unstyled">
                    {activity.recommendations.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="fas fa-lightbulb text-warning me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* restrictions */}
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-3">{getTranslation('detail.restrictions', language)}</h4>
                  <ul className="list-unstyled">
                    {activity.restrictions.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              {/*Sidebar de Precio y Disponibilidad*/}
              <div className="card">
               <div className="card-body">
                {/* Sección de Precio */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                      {getMinPrice().price !== null ? (
                        <>
                          <small className="text-muted">{getTranslation('detail.booking.from', language)}</small>
                          <div className="h3 fw-bold text-dark mb-0">
                            {currency === 'PEN' ? 'S/ ' : '$ '}{getMinPrice().price?.toFixed(2) || '0.00'}
                          </div>
                          <small className="text-muted">{getTranslation('detail.booking.perPerson', language)}</small>
                        </>
                      ) : (
                        <div className="h3 fw-bold text-dark mb-0">
                          {getTranslation('detail.booking.contactForPrice', language)}
                        </div>
                      )}
                   </div>
                    <button 
                      className="btn btn-primary btn-lg px-4"
                      onClick={scrollToBookingOptions}
                    >
                      {getTranslation('detail.booking.viewAvailability', language)}
                  </button>
                </div>

                {/* Línea separadora */}
                <hr className="my-3" />

                {/* Política de Reserva */}
                <div className="d-flex align-items-start">
                  <i className="fas fa-wallet text-muted me-2 mt-1"></i>
                    <div className="small text-muted">
                     {getTranslation('detail.booking.bookNowPayLater', language)}
                     <a href="#" className="text-primary text-decoration-underline ms-1">{getTranslation('detail.booking.readMore', language)}</a>
                   </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ActivityDetail; 