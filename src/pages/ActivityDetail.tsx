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

  // Funciones para obtener precio mínimo
  const getMinPrice = () => {
    if (!activity?.bookingOptions || activity.bookingOptions.length === 0) return null;
    
    const activeOptions = activity.bookingOptions.filter(option => option.isActive);
    if (activeOptions.length === 0) return null;
    
    return Math.min(...activeOptions.map(option => option.pricePerPerson));
  };

  const getMinPriceCurrency = () => {
    if (!activity?.bookingOptions || activity.bookingOptions.length === 0) return 'USD';
    const minOption = activity.bookingOptions.reduce((min, option) => 
      option.pricePerPerson < min.pricePerPerson ? option : min
    );
    return minOption.currency;
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

  // Sample reviews data
  const sampleReviews: Review[] = [
    {
      id: '1',
      user: {
        name: 'Maria',
        country: 'Colombia',
        initial: 'M',
        avatarColor: 'orange'
      },
      rating: 5,
      date: 'Hace 2 semanas',
      verified: true,
      text: 'Excelente experiencia en las Islas Ballestas. El guía fue muy profesional y conocedor. Pudimos ver leones marinos, pingüinos y muchas aves. El paisaje es impresionante. Totalmente recomendado.'
    },
    {
      id: '2',
      user: {
        name: 'Andrea',
        country: 'España',
        initial: 'A',
        avatarColor: 'blue'
      },
      rating: 5,
      date: 'Hace 1 mes',
      verified: true,
      text: 'Una experiencia increíble. El tour fue muy bien organizado y el personal muy amable. Las vistas desde el barco son espectaculares. Definitivamente volvería.'
    },
    {
      id: '3',
      user: {
        name: 'Edgar Fernando',
        country: 'Colombia',
        initial: 'E',
        avatarColor: 'green'
      },
      rating: 5,
      date: 'Hace 3 semanas',
      verified: true,
      text: 'Muy buena experiencia. El guía explicó todo muy bien y pudimos ver mucha fauna marina. El transporte fue puntual y cómodo.',
      images: [
        'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop'
      ]
    }
  ];

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      
      await withLoading(async () => {
        setError(null);
        
        console.log('Fetching activity with ID:', id, 'and language:', language, 'and currency:', currency);
        const activityData = await activitiesApi.getById(id, language, currency);
        console.log('Activity data received:', activityData);
        setActivity(activityData);
      }, 'activity-detail');
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
                <div className="d-flex align-items-center mb-2">
                  <div className="d-flex align-items-center me-3">
                    <svg className="text-warning me-1" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="fw-medium me-1">4.8</span>
                    <small className="text-muted">(150 {getTranslation('detail.reviews', language)})</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

                                 {/* Image Gallery Section */}
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

        {/* Contenido Principal */}
        <div className="row">
          <div className="col-lg-8">
            {/* Presentación */}
            <div className="card mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3">{getTranslation('detail.presentation', language)}</h4>
                <p className="mb-0">{activity.presentation}</p>
              </div>
            </div>

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

              {/* Opciones de Booking - Mostrar por defecto */}
              {activity.bookingOptions && activity.bookingOptions.length > 0 && (
                <div id="booking-options-section" className="card mb-4">
                  <div className="card-body">
                                         <h4 className="fw-bold mb-3">{getTranslation('detail.booking.options', language)}</h4>
                    <div className="row">
                      {activity.bookingOptions.map((option, index) => (
                        <div key={index} className="col-12 mb-3">
                          <div className="card border">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h6 className="fw-bold mb-2">{option.title}</h6>
                                                                     <div className="mb-2">
                                                                           <div className="fw-bold text-midnightblue mb-1 font-montserrat small">
                                        <i className="fas fa-clock me-1"></i>{getTranslation('detail.booking.duration', language)}
                                      </div>
                                                                           <div className="text-muted">
                                        {(() => {
                                          const hours = option.durationHours;
                                          const minutes = option.durationMinutes;
                                          
                                          // Si las horas son 0, no mostrar
                                          if (hours === 0) {
                                            return minutes > 0 ? `${minutes} ${getTranslation('detail.booking.minutes', language)}` : '';
                                          }
                                          
                                                                                     // Si las horas están entre 5 y 10, agregar "FULL DAY"
                                           if (hours > 5 && hours <= 24) {
                                             let timeText = `${hours} ${getTranslation('detail.booking.hours', language)}`;
                                             if (minutes > 0) {
                                               timeText += ` ${minutes} ${getTranslation('detail.booking.minutes', language)}`;
                                             }
                                             return (
                                               <span>
                                                 {timeText} <span className="fw-bold">{getTranslation('detail.booking.fullDay', language)}</span>
                                               </span>
                                             );
                                           }
                                          
                                          // Caso normal
                                          let timeText = `${hours} ${getTranslation('detail.booking.hours', language)}`;
                                          if (minutes > 0) {
                                            timeText += ` ${minutes} ${getTranslation('detail.booking.minutes', language)}`;
                                          }
                                          return timeText;
                                        })()}
                                      </div>
                                   </div>
                                  <div className="mb-2">
                                     <div className="fw-bold text-midnightblue mb-1 font-montserrat small">
                                        <i className="fas fa-user me-1"></i>{getTranslation('detail.booking.guide', language)}
                                      </div>
                                     <div className="d-flex flex-wrap gap-2">
                                                                                                                       {option.languages.map((lang, langIndex) => {
                                          // Mapear códigos de idioma a nombres completos según el idioma actual
                                          const getLanguageName = (code: string) => {
                                            if (language === 'es') {
                                              // Si el idioma actual es español, mostrar nombres en español
                                                                                             const spanishMap: { [key: string]: string } = {
                                                 'es': 'Español',
                                                 'en': 'Inglés'
                                               };
                                              return spanishMap[code] || code;
                                            } else {
                                              // Si el idioma actual es inglés, mostrar nombres en inglés
                                                                                             const englishMap: { [key: string]: string } = {
                                                 'es': 'Spanish',
                                                 'en': 'English'
                                               };
                                              return englishMap[code] || code;
                                            }
                                          };
                                          
                                          // Verificar si este idioma está seleccionado por el usuario
                                          const isSelected = selectedLanguages.includes(lang);
                                          
                                          return (
                                            <button
                                              key={langIndex}
                                              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                                              style={{ minWidth: '80px' }}
                                              onClick={() => handleLanguageSelection(lang)}
                                            >
                                              {getLanguageName(lang)}
                                            </button>
                                          );
                                        })}
                                     </div>
                                   </div>
                                  
                                  {/* Horarios de Salida - Botones horizontales */}
                                  {option.schedules && option.schedules.length > 0 && (
                                    <div className="mb-3">
                                       <div className="mb-2">
                                                                                   <div className="fw-bold text-midnightblue mb-1 font-montserrat small"><i className="fas fa-calendar-alt me-1"></i>{getTranslation('detail.booking.selectDepartureTime', language)}</div>
                                         {selectedDate && (
                                           <div className="text-muted">
                                             
                                             {new Date(selectedDate).toLocaleDateString('es-ES', { 
                                               weekday: 'long', 
                                               year: 'numeric', 
                                               month: 'long', 
                                               day: 'numeric' 
                                             })}
                                           </div>
                                         )}
                                       </div>
                                      <div className="d-flex flex-wrap gap-2">
                                        {(() => {
                                          const availableSchedules = getSchedulesForSelectedDate(option.schedules)
                                            .filter(schedule => schedule.isActive);
                                          
                                          if (availableSchedules.length === 0) {
                                            return (
                                                                                             <div className="text-muted small">
                                                 {selectedDate 
                                                   ? getTranslation('detail.booking.noSchedulesAvailable', language)
                                                   : getTranslation('detail.booking.noSchedules', language)
                                                 }
                                               </div>
                                            );
                                          }
                                          
                                                                                     return availableSchedules.map((schedule, scheduleIndex) => {
                                             // Convertir hora a formato AM/PM
                                             const formatTime = (timeString: string) => {
                                               const [hours, minutes] = timeString.split(':');
                                               const hour = parseInt(hours);
                                               const ampm = hour >= 12 ? 'PM' : 'AM';
                                               const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                                               return `${displayHour}:${minutes} ${ampm}`;
                                             };

                                             // Formatear día de la semana
                                             const formatDayOfWeek = (dayOfWeek: number) => {
                                               const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                                               return days[dayOfWeek] || '';
                                             };

                                             // Crear ID único para el horario
                                             const scheduleId = `${option.title}-${schedule.startTime}-${schedule.dayOfWeek}`;
                                             const isSelected = selectedSchedule === scheduleId;

                                             return (
                                               <button
                                                 key={scheduleIndex}
                                                 className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                                                 style={{ minWidth: '120px' }}
                                                 onClick={() => handleScheduleSelection(scheduleId)}
                                               >
                                                 <div className="small"><div className="fw-bold">{formatTime(schedule.startTime)}</div></div>
                                               </button>
                                             );
                                           });
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                  
                                                                     {/* Meeting Point Section */}
                                   {option.meetingPointDescription && option.meetingPointDescription.length > 0 && (
                                     <div className="mb-3">
                                       <div className="fw-bold text-midnightblue mb-1 font-montserrat small">
                                         <i className="fas fa-map-marker-alt me-1"></i>{getTranslation('detail.booking.meetingPoint', language)}
                                       </div>
                                       
                                                                               {/* REFERENCE_CITY_WITH_LIST - Radio buttons for selection */}
                                        {option.meetingType === 'REFERENCE_CITY_WITH_LIST' && (
                                          <div className="mt-2">
                                            <div className="small text-muted mb-2">
                                              {getTranslation('detail.booking.selectMeetingPoint', language)}:
                                            </div>
                                            <div className="d-flex flex-column gap-2">
                                              {option.meetingPointDescription.map((point, pointIndex) => (
                                                <div key={pointIndex} className="form-check">
                                                  <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name={`meeting-point-${option.title}`}
                                                    id={`meeting-point-${option.title}-${pointIndex}`}
                                                    value={point}
                                                    checked={selectedMeetingPoints[option.title] === point}
                                                    onChange={() => handleMeetingPointSelection(option.title, point)}
                                                  />
                                                  <label className="form-check-label small" htmlFor={`meeting-point-${option.title}-${pointIndex}`}>
                                                    {point}
                                                  </label>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                       
                                       {/* MEETING_POINT - Show as address */}
                                       {option.meetingType === 'MEETING_POINT' && (
                                         <div className="mt-2">
                                           <div className="small text-muted">
                                             <i className="fas fa-map-marker-alt me-1"></i>
                                             {option.meetingPointDescription.join(', ')}
                                           </div>
                                         </div>
                                       )}
                                       
                                                                               {/* PICKUP_HOTEL - Google Maps search */}
                                        {option.meetingType === 'PICKUP_HOTEL' && (
                                          <div className="mt-2">
                                            <div className="small text-muted mb-2">
                                              {getTranslation('detail.booking.hotelLocation', language)}:
                                            </div>
                                            <div className="input-group input-group-sm mb-2">
                                              <input
                                                type="text"
                                                className="form-control"
                                                placeholder={getTranslation('detail.booking.searchHotel', language)}
                                                id={`hotel-search-${option.title}`}
                                                onChange={(e) => handleHotelSearch(option.title, e.target.value)}
                                              />
                                              <button className="btn btn-outline-primary" type="button">
                                                <i className="fas fa-search"></i>
                                              </button>
                                            </div>
                                            
                                            {/* Hotel search results */}
                                            {hotelSearchResults[option.title] && hotelSearchResults[option.title].length > 0 && (
                                              <div className="mt-2">
                                                <div className="small text-muted mb-2">
                                                  {getTranslation('detail.booking.selectHotel', language)}:
                                                </div>
                                                <div className="d-flex flex-column gap-2">
                                                  {hotelSearchResults[option.title].map((hotel, hotelIndex) => (
                                                    <div key={hotelIndex} className="form-check">
                                                      <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name={`hotel-${option.title}`}
                                                        id={`hotel-${option.title}-${hotelIndex}`}
                                                        value={hotel.name}
                                                        checked={selectedMeetingPoints[option.title] === hotel.name}
                                                        onChange={() => handleMeetingPointSelection(option.title, hotel.name)}
                                                      />
                                                      <label className="form-check-label small" htmlFor={`hotel-${option.title}-${hotelIndex}`}>
                                                        <div className="fw-bold">{hotel.name}</div>
                                                        <div className="text-muted">{hotel.address}</div>
                                                      </label>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            
                                            <div className="small text-muted mt-2">
                                              {getTranslation('detail.booking.hotelDescription', language)}
                                            </div>
                                          </div>
                                        )}
                                     </div>
                                   )}
                                  <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-calendar-check text-muted me-2"></i>
                                                                         <small className="text-muted">
                                       {getTranslation('detail.booking.cancellationPolicy', language)}
                                     </small>
                                  </div>
                                </div>
                                                                 <div className="text-end">
                                   <div className="h4 fw-bold text-primary mb-1">
                                     {option.currency === 'USD' ? '$' : 'S/'} {option.pricePerPerson.toFixed(2)}
                                   </div>
                                                                       <small className="text-muted">{getTranslation('detail.booking.oneAdult', language)}</small>
                                    <div className="small text-muted">{getTranslation('detail.booking.allTaxesIncluded', language)}</div>
                                 </div>
                              </div>
                              {/* Botones de acción - Ancho completo */}
                              <div className="mt-3 pt-3 border-top">
                                <div className="d-flex justify-content-end gap-2">
                                                                     <button className="btn btn-outline-primary">
                                     {getTranslation('detail.booking.reserveNow', language)}
                                   </button>
                                   <button className="btn btn-primary">
                                     {getTranslation('detail.booking.addToCart', language)}
                                   </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar de Precio y Disponibilidad */}
           <div className="col-lg-4">
             <div className="card">
               <div className="card-body">
                {/* Sección de Precio */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                                     <div>
                                           {getMinPrice() !== null ? (
                                             <>
                                               <small className="text-muted">{getTranslation('detail.booking.from', language)}</small>
                                               <div className="h3 fw-bold text-dark mb-0">
                                                 {getMinPriceCurrency() === 'USD' ? '$' : 'S/'} {getMinPrice()!.toFixed(2)}
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

      {/* Itinerario - Ancho completo - Solo mostrar si hay datos de itinerario */}
      {activity.itineraries && activity.itineraries.length > 0 && (
        <div className="container-fluid py-5 bg-white">
          <div className="container">
            <div className="card">
              <div className="card-body">
                <Itinerary items={activity.itineraries} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reseñas - Ancho completo */}
      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <Reviews reviews={sampleReviews} />
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default ActivityDetail; 