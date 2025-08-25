import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../utils/translations';
import OptionSetupLayout from '../../../components/OptionSetupLayout';
import { useAppSelector } from '../../../redux/store';
import { bookingOptionApi, AvailabilityPricingMode } from '../../../api/bookingOption';

interface ScheduleData {
  scheduleName: string;
  startDate: string;
  hasEndDate: boolean;
  endDate: string;
  weeklySchedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  timeSlots: {
    [key: string]: Array<{
      id: string;
      hour: string;
      minute: string;
    }>;
  };
  exceptions: Array<{
    date: string;
    description: string;
  }>;
}

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

export default function StepOptionAvailabilityPricingDepartureTime() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activityId } = useAppSelector(state => state.activityCreation);
  
  // Get current step from URL params, default to step 1 (Horario)
  const currentStep = parseInt(searchParams.get('step') || '1');
  
  const [formData, setFormData] = useState<ScheduleData>({
    scheduleName: '',
    startDate: '',
    hasEndDate: false,
    endDate: '',
    weeklySchedule: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    timeSlots: {},
    exceptions: []
  });

  // Estado para el modo de disponibilidad y precios
  const [availabilityPricingMode, setAvailabilityPricingMode] = useState<AvailabilityPricingMode | null>(null);
  const [isLoadingMode, setIsLoadingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para el tipo de precios en step 2
  const [pricingType, setPricingType] = useState<'same' | 'ageBased'>('same');
  
  // Estado para grupos de edad
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([
    { id: '1', name: 'Infantes', minAge: 0, maxAge: 3 },
    { id: '2', name: 'Niños', minAge: 4, maxAge: 12 },
    { id: '3', name: 'Adultos', minAge: 13, maxAge: 64 },
    { id: '4', name: 'Adulto mayor', minAge: 65, maxAge: 99 }
  ]);

  // Estado para mostrar ajustes avanzados
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Función helper para formatear fechas al formato esperado por la API Java
  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Asegurar que la fecha esté en formato YYYY-MM-DD
      // Si ya está en formato correcto, retornarla directamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Si no, convertirla
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      // Formato YYYY-MM-DD que es compatible con Java LocalDate
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error al formatear fecha:', dateString, error);
      return '';
    }
  };

  // Funciones para manejar grupos de edad
  const handleAddAgeGroup = () => {
    // Solo permitir agregar "Infante" o "Adulto mayor"
    const existingInfante = ageGroups.some(group => group.name === 'Infante');
    const existingAdultoMayor = ageGroups.some(group => group.name === 'Adulto mayor');
    
    if (!existingInfante) {
      // Agregar Infante al principio
      const newInfante: AgeGroup = {
        id: Date.now().toString(),
        name: 'Infante',
        minAge: 0,
        maxAge: 0
      };
      
      setAgeGroups(prev => {
        const updatedGroups = [newInfante, ...prev];
        const connectedGroups = connectAgeRanges(updatedGroups);
        return ensureProtectedGroupNames(connectedGroups);
      });
    } else if (!existingAdultoMayor) {
      // Agregar Adulto mayor al final
      const newAdultoMayor: AgeGroup = {
        id: (Date.now() + 1).toString(),
        name: 'Adulto mayor',
        minAge: 0,
        maxAge: 0
      };
      
      setAgeGroups(prev => {
        const updatedGroups = [...prev, newAdultoMayor];
        const connectedGroups = connectAgeRanges(updatedGroups);
        return ensureProtectedGroupNames(connectedGroups);
      });
    } else {
      // Ambos grupos ya existen
      alert('Ya existen los grupos "Infante" y "Adulto mayor". No se pueden agregar más grupos.');
    }
  };

  const handleRemoveAgeGroup = (groupId: string) => {
    // Verificar si el grupo está protegido
    const groupToRemove = ageGroups.find(group => group.id === groupId);
    if (groupToRemove && (groupToRemove.name === 'Niños' || groupToRemove.name === 'Adultos')) {
      alert('No se puede eliminar el grupo "Niños" o "Adultos". Estos grupos son obligatorios.');
      return;
    }
    
    if (ageGroups.length > 1) {
      setAgeGroups(prev => {
        const updatedGroups = prev.filter(group => group.id !== groupId);
        const connectedGroups = connectAgeRanges(updatedGroups);
        return ensureProtectedGroupNames(connectedGroups);
      });
    }
  };

  const handleAgeGroupChange = (groupId: string, field: 'name' | 'minAge' | 'maxAge', value: string | number) => {
    setAgeGroups(prev => {
      const updatedGroups = prev.map(group => 
        group.id === groupId ? { ...group, [field]: value } : group
      );
      
      // Si se cambió la edad mínima o máxima, reconectar los rangos
      if (field === 'minAge' || field === 'maxAge') {
        const connectedGroups = connectAgeRanges(updatedGroups);
        return ensureProtectedGroupNames(connectedGroups);
      }
      
      // Si se cambió el nombre, verificar si es un grupo protegido
      if (field === 'name') {
        return ensureProtectedGroupNames(updatedGroups);
      }
      
      return updatedGroups;
    });
  };

  // Función para conectar automáticamente los rangos de edad
  const connectAgeRanges = (groups: AgeGroup[]): AgeGroup[] => {
    // Ordenar grupos según el orden específico: Infante → Niños → Adultos → Adulto mayor
    const sortedGroups = [...groups].sort((a, b) => {
      const orderMap: { [key: string]: number } = {
        'Infante': 0,
        'Niños': 1,
        'Adultos': 2,
        'Adulto mayor': 3
      };
      
      const orderA = orderMap[a.name] ?? 999;
      const orderB = orderMap[b.name] ?? 999;
      
      return orderA - orderB;
    });
    
    // Conectar solo las edades mínimas basándose en las edades máximas del grupo anterior
    for (let i = 0; i < sortedGroups.length; i++) {
      const currentGroup = sortedGroups[i];
      
      if (i === 0) {
        // El primer grupo siempre empieza en 0
        currentGroup.minAge = 0;
      } else {
        // Los demás grupos empiezan en la edad máxima del grupo anterior + 1
        const previousGroup = sortedGroups[i - 1];
        currentGroup.minAge = previousGroup.maxAge + 1;
      }
      
      // NO ajustar la edad máxima del usuario - mantener exactamente lo que editó
      // Solo conectar las edades mínimas
    }
    
    return sortedGroups;
  };

  // Función para asegurar que los grupos protegidos mantengan sus nombres
  const ensureProtectedGroupNames = (groups: AgeGroup[]): AgeGroup[] => {
    return groups.map(group => {
      // Si es el grupo con edad 4-12, asegurar que se llame "Niños"
      if (group.minAge === 4 && group.maxAge === 12) {
        return { ...group, name: 'Niños' };
      }
      // Si es el grupo con edad 13-64, asegurar que se llame "Adultos"
      if (group.minAge === 13 && group.maxAge === 64) {
        return { ...group, name: 'Adultos' };
      }
      return group;
    });
  };

  // Función para ajustar manualmente un rango de edad
  const handleManualAgeRangeChange = (groupId: string, field: 'minAge' | 'maxAge', value: number) => {
    console.log('handleManualAgeRangeChange called:', { groupId, field, value });
    
    // Solo permitir editar la edad máxima
    if (field === 'minAge') {
      console.log('Blocking minAge edit');
      return; // No permitir edición de edad mínima
    }
    
    console.log('Processing maxAge edit');
    
    // Validar que el valor sea un número válido
    if (isNaN(value) || value < 0 || value > 99) {
      console.log('Invalid value:', value);
      return;
    }
    
    setAgeGroups(prev => {
      console.log('Previous age groups:', prev);
      
      // Encontrar el grupo a editar
      const groupIndex = prev.findIndex(group => group.id === groupId);
      if (groupIndex === -1) {
        console.log('Group not found:', groupId);
        return prev;
      }
      
      // Crear una copia del array
      const newGroups = [...prev];
      
      // Actualizar solo la edad máxima del grupo específico
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        maxAge: value
      };
      
      console.log('Updated groups before connection:', newGroups);
      
      // Aplicar conexión automática solo a las edades mínimas
      const connectedGroups = connectAgeRanges(newGroups);
      console.log('Connected groups:', connectedGroups);
      
      // Aplicar protección de nombres
      const finalGroups = ensureProtectedGroupNames(connectedGroups);
      console.log('Final groups after protection:', finalGroups);
      
      return finalGroups;
    });
  };

  // Función para aplicar la conexión automática cuando se necesite
  const applyAgeRangeConnection = () => {
    setAgeGroups(prev => {
      const connectedGroups = connectAgeRanges(prev);
      return ensureProtectedGroupNames(connectedGroups);
    });
  };

  // Función para resetear a los grupos por defecto
  const resetToDefaultGroups = () => {
    const defaultGroups: AgeGroup[] = [
      { id: '1', name: 'Infantes', minAge: 0, maxAge: 3 },
      { id: '2', name: 'Niños', minAge: 4, maxAge: 12 },
      { id: '3', name: 'Adultos', minAge: 13, maxAge: 64 },
      { id: '4', name: 'Adulto mayor', minAge: 65, maxAge: 99 }
    ];
    setAgeGroups(defaultGroups);
  };

  // Función para validar que no haya gaps en los rangos de edad
  const validateAgeRanges = (groups: AgeGroup[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Ordenar grupos según el orden específico
    const sortedGroups = [...groups].sort((a, b) => {
      const orderMap: { [key: string]: number } = {
        'Infante': 0,
        'Niños': 1,
        'Adultos': 2,
        'Adulto mayor': 3
      };
      
      const orderA = orderMap[a.name] ?? 999;
      const orderB = orderMap[b.name] ?? 999;
      
      return orderA - orderB;
    });
    
    // Validar que el primer grupo empiece en 0
    if (sortedGroups[0].minAge !== 0) {
      errors.push('El primer grupo debe empezar en 0');
    }
    
    // Validar que no haya gaps entre grupos
    for (let i = 0; i < sortedGroups.length - 1; i++) {
      const currentGroup = sortedGroups[i];
      const nextGroup = sortedGroups[i + 1];
      
      if (currentGroup.maxAge + 1 !== nextGroup.minAge) {
        errors.push(`Gap detectado entre ${currentGroup.name} (${currentGroup.maxAge}) y ${nextGroup.name} (${nextGroup.minAge})`);
      }
    }
    
    // Validar que todos los grupos tengan nombres válidos
    const invalidNames = groups.filter(group => !group.name.trim());
    if (invalidNames.length > 0) {
      errors.push('Todos los grupos deben tener un nombre válido');
    }
    
    // Validar que las edades máximas sean mayores que las mínimas
    const invalidRanges = groups.filter(group => group.minAge >= group.maxAge);
    if (invalidRanges.length > 0) {
      errors.push('La edad mínima debe ser menor que la edad máxima para todos los grupos');
    }
    
    // Validar que existan los grupos obligatorios
    const hasNinos = groups.some(group => group.name === 'Niños');
    const hasAdultos = groups.some(group => group.name === 'Adultos');
    
    if (!hasNinos) {
      errors.push('Debe existir un grupo llamado "Niños"');
    }
    
    if (!hasAdultos) {
      errors.push('Debe existir un grupo llamado "Adultos"');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Función para guardar la configuración de grupos de edad
  const handleSaveAgeGroups = () => {
    // Aplicar conexión automática antes de validar
    setAgeGroups(prev => {
      const connectedGroups = connectAgeRanges(prev);
      const finalGroups = ensureProtectedGroupNames(connectedGroups);
      
      // Validar después de conectar
      const validation = validateAgeRanges(finalGroups);
      
      if (!validation.isValid) {
        alert(`Error: ${validation.errors.join('\n')}`);
        return prev; // Mantener el estado anterior si hay errores
      }
      
      // Guardar la configuración en localStorage
      localStorage.setItem(`${storageKey}_ageGroups`, JSON.stringify(finalGroups));
      localStorage.setItem(`${storageKey}_pricingType`, pricingType);
      
      // Mostrar mensaje de éxito
      alert('¡Configuración de grupos de edad guardada exitosamente!');
      
      // Continuar al step 3
      navigate(`/extranet/activity/availabilityPricing?step=3&optionId=${optionId}&lang=${lang}&currency=${currency}`);
      
      return finalGroups;
    });
  };

  const optionId = searchParams.get('optionId');
  const lang = searchParams.get('lang');
  const currency = searchParams.get('currency');
  const storageKey = `schedule_${optionId || 'default'}`;

  // Función para obtener el modo de disponibilidad y precios
  const fetchAvailabilityPricingMode = async () => {
    if (!optionId) return;
    
    setIsLoadingMode(true);
    try {
      const response = await bookingOptionApi.getAvailabilityPricingMode(optionId);
      
      if ('success' in response && response.success === false) {
        // Es un error de la API
        console.error('Error al obtener modo de disponibilidad:', response.message);
        // Mantener el modo por defecto (TIME_SLOTS)
        setAvailabilityPricingMode({
          availabilityMode: 'TIME_SLOTS',
          pricingMode: 'PER_PERSON'
        });
      } else {
        // Es una respuesta exitosa
        setAvailabilityPricingMode(response as AvailabilityPricingMode);
        console.log('Modo de disponibilidad obtenido:', response);
      }
    } catch (error) {
      console.error('Error al obtener modo de disponibilidad:', error);
      // En caso de error, usar modo por defecto
      setAvailabilityPricingMode({
        availabilityMode: 'TIME_SLOTS',
        pricingMode: 'PER_PERSON'
      });
    } finally {
      setIsLoadingMode(false);
    }
  };

  // Cargar datos guardados al inicializar
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        console.log('StepOptionAvailabilityPricingDepartureTime: Datos cargados desde localStorage:', parsedData);
      } catch (error) {
        console.error('StepOptionAvailabilityPricingDepartureTime: Error al cargar datos desde localStorage:', error);
      }
    }
    
    // Cargar configuración de precios guardada
    const savedPricingType = localStorage.getItem(`${storageKey}_pricingType`);
    if (savedPricingType) {
      setPricingType(savedPricingType as 'same' | 'ageBased');
    }
    
    // Cargar grupos de edad guardados
    const savedAgeGroups = localStorage.getItem(`${storageKey}_ageGroups`);
    if (savedAgeGroups) {
      try {
        const parsedAgeGroups = JSON.parse(savedAgeGroups);
        setAgeGroups(parsedAgeGroups);
      } catch (error) {
        console.error('Error al cargar grupos de edad desde localStorage:', error);
      }
    }
  }, [storageKey]);

  // Obtener el modo de disponibilidad al inicializar
  useEffect(() => {
    fetchAvailabilityPricingMode();
  }, [optionId]);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
      console.log('StepOptionAvailabilityPricingDepartureTime: Datos guardados en localStorage:', formData);
    }
  }, [formData, storageKey]);

  const handleSaveAndContinue = async () => {
    console.log('StepOptionAvailabilityPricingDepartureTime: Guardando y continuando con datos:', formData);
    
    // Si estamos en el step 1, consumir la API antes de continuar
    if (currentStep === 1) {
      try {
        // Verificar que activityId esté disponible
        if (!activityId) {
          alert('Error: No se encontró información de la actividad');
          return;
        }

        // Validar que se haya ingresado un nombre para el horario
        if (!formData.scheduleName.trim()) {
          alert('Error: Debe ingresar un nombre para el horario');
          return;
        }

        // Validar que se haya seleccionado una fecha de inicio
        if (!formData.startDate) {
          alert('Error: Debe seleccionar una fecha de inicio');
          return;
        }

        // Validar que la fecha de inicio sea válida
        if (isNaN(new Date(formData.startDate).getTime())) {
          alert('Error: La fecha de inicio no es válida');
          return;
        }

        // Validar que la fecha de fin sea válida si está configurada
        if (formData.hasEndDate && formData.endDate && isNaN(new Date(formData.endDate).getTime())) {
          alert('Error: La fecha de fin no es válida');
          return;
        }

        // Validar que las fechas se puedan formatear correctamente
        const formattedStartDate = formatDateForAPI(formData.startDate);
        if (!formattedStartDate) {
          alert('Error: La fecha de inicio no se puede procesar correctamente');
          return;
        }

        // Validar que la fecha de inicio tenga el formato correcto
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedStartDate)) {
          alert('Error: El formato de la fecha de inicio no es válido');
          return;
        }

        if (formData.hasEndDate && formData.endDate) {
          const formattedEndDate = formatDateForAPI(formData.endDate);
          if (!formattedEndDate) {
            alert('Error: La fecha de fin no se puede procesar correctamente');
            return;
          }
          
          // Validar que la fecha de fin tenga el formato correcto
          if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedEndDate)) {
            alert('Error: El formato de la fecha de fin no es válido');
            return;
          }
        }

        // Validar que se haya configurado al menos un horario semanal
        const hasTimeSlots = Object.values(formData.timeSlots).some(slots => slots.length > 0);
        if (!hasTimeSlots) {
          alert('Error: Debe configurar al menos un horario semanal');
          return;
        }

        // Validar que las excepciones tengan fechas válidas
        for (let i = 0; i < formData.exceptions.length; i++) {
          const exception = formData.exceptions[i];
          if (exception.date && exception.date.trim()) {
            const formattedExceptionDate = formatDateForAPI(exception.date);
            if (!formattedExceptionDate || !/^\d{4}-\d{2}-\d{2}$/.test(formattedExceptionDate)) {
              alert(`Error: La fecha de la excepción ${i + 1} no es válida`);
              return;
            }
          }
        }

        // Activar estado de carga
        setIsSaving(true);

        // Preparar los datos para la API createAvailabilityPricingDepartureTime
        const requestData = {
          activityId: activityId,
          bookingOptionId: optionId || '',
          title: formData.scheduleName,
          lang: lang || 'es',
          startDate: formattedStartDate,
          endDate: formData.hasEndDate && formData.endDate ? formatDateForAPI(formData.endDate) : undefined,
          weeklySchedule: Object.entries(formData.timeSlots).flatMap(([day, slots]) => {
            if (slots.length === 0) return [];
            
            return slots.map(slot => {
              const dayMap: { [key: string]: number } = {
                'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
                'friday': 4, 'saturday': 5, 'sunday': 6
              };
              
              return {
                dayOfWeek: dayMap[day] || 0,
                startTime: `${slot.hour}:${slot.minute}`,
                endTime: availabilityPricingMode?.availabilityMode === 'OPENING_HOURS' ? 
                  `${slot.hour}:${slot.minute}` : undefined
              };
            });
          }),
          exceptions: formData.exceptions
            .filter(exception => exception.date && exception.date.trim() && exception.description && exception.description.trim())
            .map(exception => ({
              date: formatDateForAPI(exception.date),
              description: exception.description
            }))
        };

        console.log('StepOptionAvailabilityPricingDepartureTime: Enviando datos a la API createAvailabilityPricingDepartureTime:', requestData);
        console.log('StepOptionAvailabilityPricingDepartureTime: Weekly Schedule procesado:', requestData.weeklySchedule);
        console.log('StepOptionAvailabilityPricingDepartureTime: Excepciones procesadas:', requestData.exceptions);
        console.log('StepOptionAvailabilityPricingDepartureTime: Fechas procesadas - startDate:', requestData.startDate, 'endDate:', requestData.endDate);
        console.log('StepOptionAvailabilityPricingDepartureTime: Fechas originales - startDate:', formData.startDate, 'endDate:', formData.endDate);
        console.log('StepOptionAvailabilityPricingDepartureTime: Fechas formateadas - startDate:', formattedStartDate, 'endDate:', formData.hasEndDate && formData.endDate ? formatDateForAPI(formData.endDate) : 'undefined');
        
        // Validación final: asegurar que no se envíen fechas vacías
        if (!requestData.startDate || requestData.startDate.trim() === '') {
          alert('Error: La fecha de inicio no puede estar vacía');
          return;
        }
        
        // Debug: mostrar el JSON exacto que se enviará
        console.log('StepOptionAvailabilityPricingDepartureTime: JSON a enviar:', JSON.stringify(requestData, null, 2));
        
        // Consumir la API correcta
        const response = await bookingOptionApi.createAvailabilityPricingDepartureTime(requestData);
        
        if (response.success) {
          console.log('StepOptionAvailabilityPricingDepartureTime: API exitosa, ID creado:', response.idCreated);
          
          // Mostrar mensaje de éxito temporal
          alert('¡Configuración de horarios y tiempo de salida guardada exitosamente! Redirigiendo al siguiente paso...');
          
          // Recargar la página con step=2
          window.location.href = `/extranet/activity/availabilityPricing/create?optionId=${optionId}&lang=${lang}&currency=${currency}&step=2`;
          return;
        } else {
          console.error('StepOptionAvailabilityPricingDepartureTime: Error en la API:', response.message);
          // Mostrar error al usuario
          alert(`Error al guardar: ${response.message}`);
          return;
        }
      } catch (error) {
        console.error('StepOptionAvailabilityPricingDepartureTime: Error al consumir la API:', error);
        alert('Error de conexión al guardar los datos');
      } finally {
        // Desactivar estado de carga
        setIsSaving(false);
      }
    }
    
    // Si estamos en el step 2 y pricingMode = PER_PERSON
    if (currentStep === 2 && availabilityPricingMode?.pricingMode === 'PER_PERSON') {
      // Validar que se haya seleccionado un tipo de precio
      if (!pricingType) {
        alert('Error: Debe seleccionar un tipo de precio');
        return;
      }
      
      // Si se selecciona "El precio es igual para todos", continuar al step 3
      if (pricingType === 'same') {
        // Guardar la selección en localStorage
        localStorage.setItem(`${storageKey}_pricingType`, pricingType);
        
        // Navegar al step 3
        navigate(`/extranet/activity/availabilityPricing?step=3&optionId=${optionId}&lang=${lang}&currency=${currency}`);
        return;
      }
      
      // Si se selecciona "El precio depende de la edad", mostrar la interfaz de grupos de edad
      // (ya está implementada en el render)
      return;
    }
    
    // Para otros steps, navegar normalmente
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      navigate(`/extranet/activity/availabilityPricing?step=${nextStep}&optionId=${optionId}&lang=${lang}&currency=${currency}`);
    } else {
      // If we're at the last step, go back to the main availability pricing page
      navigate('/extranet/activity/availabilityPricing');
    }
  };

  const handleBack = () => {
    console.log('StepOptionAvailabilityPricingDepartureTime: Datos mantenidos en localStorage al regresar');
    
    // Navigate to previous step based on current step
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      navigate(`/extranet/activity/availabilityPricing?step=${prevStep}&optionId=${optionId}&lang=${lang}&currency=${currency}`);
    } else {
      // If we're at the first step, go back to the main availability pricing page
      navigate('/extranet/activity/availabilityPricing');
    }
  };

  const handleAddException = () => {
    setFormData(prev => ({
      ...prev,
      exceptions: [...prev.exceptions, { date: '', description: '' }]
    }));
  };

  const handleRemoveException = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exceptions: prev.exceptions.filter((_, i) => i !== index)
    }));
  };

  const handleExceptionChange = (index: number, field: 'date' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      exceptions: prev.exceptions.map((exception, i) => 
        i === index ? { ...exception, [field]: value } : exception
      )
    }));
  };

  // Time slot management functions
  const handleAddTimeSlot = (day: string) => {
    const newTimeSlot = {
      id: Date.now().toString(),
      hour: '08',
      minute: '00'
    };
    
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [day]: [...(prev.timeSlots[day] || []), newTimeSlot]
      }
    }));
  };

  const handleRemoveTimeSlot = (day: string, timeSlotId: string) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [day]: (prev.timeSlots[day] || []).filter(slot => slot.id !== timeSlotId)
      }
    }));
  };

  const handleTimeSlotChange = (day: string, timeSlotId: string, field: 'hour' | 'minute', value: string) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [day]: (prev.timeSlots[day] || []).map(slot => 
          slot.id === timeSlotId ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

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
                <p className="text-muted">Cargando configuración del horario...</p>
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
                <div className="text-warning">
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
                {/* Step Navigation */}
                 <div className="mb-5">
                   <div className="d-flex align-items-center justify-content-between">
                     {/* Step 1: Horario */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 1 ? 'bg-primary text-white' : currentStep > 1 ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         {currentStep > 1 ? (
                           <i className="fas fa-check"></i>
                         ) : (
                           <span className="fw-bold">1</span>
                         )}
                       </div>
                       <div>
                         <span className={currentStep === 1 ? 'fw-bold text-dark' : currentStep > 1 ? 'fw-bold text-success' : 'text-muted'}>Horario</span>
                         {currentStep === 1 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>

                     {/* Connector Line */}
                     <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: currentStep > 1 ? '#28a745' : '#e9ecef' }}></div>

                     {/* Step 2: Categorías de precios */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 2 ? 'bg-primary text-white' : currentStep > 2 ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         {currentStep > 2 ? (
                           <i className="fas fa-check"></i>
                         ) : (
                           <span className="fw-bold">2</span>
                         )}
                       </div>
                       <div>
                         <span className={currentStep === 2 ? 'fw-bold text-dark' : currentStep > 2 ? 'fw-bold text-success' : 'text-muted'}>Categorías de precios</span>
                         {currentStep === 2 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>

                     {/* Connector Line */}
                     <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: currentStep > 2 ? '#28a745' : '#e9ecef' }}></div>

                     {/* Step 3: Capacidad */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 3 ? 'bg-primary text-white' : currentStep > 3 ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         {currentStep > 3 ? (
                           <i className="fas fa-check"></i>
                         ) : (
                           <span className="fw-bold">3</span>
                         )}
                       </div>
                       <div>
                         <span className={currentStep === 3 ? 'fw-bold text-dark' : currentStep > 3 ? 'fw-bold text-success' : 'text-muted'}>Capacidad</span>
                         {currentStep === 3 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>

                     {/* Connector Line */}
                     <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: currentStep > 3 ? '#28a745' : '#e9ecef' }}></div>

                     {/* Step 4: Precio */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 4 ? 'bg-primary text-white' : currentStep > 4 ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         {currentStep > 4 ? (
                           <i className="fas fa-check"></i>
                         ) : (
                           <span className="fw-bold">4</span>
                         )}
                       </div>
                       <div>
                         <span className={currentStep === 4 ? 'fw-bold text-dark' : currentStep > 4 ? 'fw-bold text-success' : 'text-muted'}>Precio</span>
                         {currentStep === 4 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>

                     {/* Connector Line */}
                     <div className="flex-grow-1 mx-3" style={{ height: '2px', backgroundColor: currentStep > 4 ? '#28a745' : '#e9ecef' }}></div>

                     {/* Step 5: Actividades complementarias */}
                     <div className="d-flex align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${currentStep === 5 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                         <span className="fw-bold">5</span>
                       </div>
                       <div>
                         <span className={currentStep === 5 ? 'fw-bold text-dark' : 'text-muted'}>Actividades complementarias (opcionales)</span>
                         {currentStep === 5 && <div className="bg-primary" style={{ height: '3px', width: '100%' }}></div>}
                       </div>
                     </div>
                   </div>
                 </div>

                  {/* Step Content - Conditional Display */}
                  {currentStep === 1 ? (
                    // Paso 1: Horario - Contenido completo
                    <div>
                      {/* Indicador de carga para el modo de disponibilidad */}
                                          {isLoadingMode && (
                      <div className="mb-4">
                        <div className="text-info">
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Cargando configuración de horarios...
                        </div>
                      </div>
                    )}

                                          {/* Información del modo de disponibilidad */}
                    {!isLoadingMode && availabilityPricingMode && (
                      <div className="mb-4">
                        <div className={`${availabilityPricingMode.availabilityMode === 'TIME_SLOTS' ? 'text-success' : 'text-warning'}`}>
                          <i className={`fas ${availabilityPricingMode.availabilityMode === 'TIME_SLOTS' ? 'fa-clock' : 'fa-door-open'} me-2`}></i>
                          <strong>Modo de horario:</strong> {
                            availabilityPricingMode.availabilityMode === 'TIME_SLOTS' 
                              ? 'Franjas horarias (TIME_SLOTS)' 
                              : 'Horario de apertura (OPENING_HOURS)'
                          }
                          {availabilityPricingMode.pricingMode && (
                            <span className="ms-2">
                              • <strong>Modo de precios:</strong> {
                                availabilityPricingMode.pricingMode === 'PER_PERSON' 
                                  ? 'Por persona' 
                                  : 'Por grupo'
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                      {/* Nombre del horario */}
                      <div className="mb-4">
                        <label htmlFor="scheduleName" className="form-label fw-bold">
                          {getTranslation('stepSchedule.name.title', language)}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="scheduleName"
                          maxLength={50}
                          value={formData.scheduleName}
                          onChange={(e) => setFormData({...formData, scheduleName: e.target.value})}
                          placeholder={getTranslation('stepSchedule.name.placeholder', language)}
                        />
                        <div className="form-text text-muted mt-1">
                          {formData.scheduleName.length}/50 caracteres
                        </div>
                      </div>

                      {/* Fecha de inicio */}
                      <div className="mb-4">
                        <label htmlFor="startDate" className="form-label fw-bold">
                          {getTranslation('stepSchedule.startDate.title', language)}
                        </label>
                        <div className="input-group">
                          <input
                            type="date"
                            className="form-control"
                            id="startDate"
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          />
                          <span className="input-group-text">
                            <i className="fas fa-calendar"></i>
                          </span>
                        </div>
                        
                        <div className="form-check mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="hasEndDate"
                            checked={formData.hasEndDate}
                            onChange={(e) => setFormData({...formData, hasEndDate: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="hasEndDate">
                            {getTranslation('stepSchedule.startDate.hasEndDate', language)}
                          </label>
                        </div>

                        {formData.hasEndDate && (
                          <div className="mt-2">
                            <input
                              type="date"
                              className="form-control"
                              value={formData.endDate}
                              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                              min={formData.startDate}
                            />
                          </div>
                        )}
                      </div>
                      {/* Horario semanal según availabilityMode */}
                      {!availabilityPricingMode ? (
                        // Estado de carga o error
                        <div className="mb-4">
                                                  <div className="text-warning">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          No se pudo cargar la configuración de horarios. Se mostrará el modo por defecto.
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-warning ms-3"
                            onClick={fetchAvailabilityPricingMode}
                            disabled={isLoadingMode}
                          >
                            <i className="fas fa-sync-alt me-1"></i>
                            Reintentar
                          </button>
                        </div>
                          
                          {/* Mostrar horario estándar como fallback */}
                          <div className="mb-4">
                            <div className="mb-3">
                              <h5 className="fw-bold mb-0">
                                {getTranslation('stepSchedule.weeklySchedule.title', language)}
                              </h5>
                            </div>

                            <div className="row">
                              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                <div key={day} className="col-12 mb-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <span className="fw-semibold me-3" style={{ minWidth: '100px' }}>
                                      {getTranslation(`stepSchedule.weeklySchedule.${day}`, language)}
                                    </span>
                                    <button 
                                      type="button" 
                                      className="btn btn-link text-primary p-0"
                                      onClick={() => handleAddTimeSlot(day)}
                                    >
                                      <i className="fas fa-plus me-1"></i>
                                      {getTranslation('stepSchedule.weeklySchedule.addTimeSlot', language)}
                                    </button>
                                  </div>
                                  
                                  {/* Display existing time slots */}
                                  {(formData.timeSlots[day] || []).map((timeSlot) => (
                                    <div key={timeSlot.id} className="d-flex align-items-center mb-2 ms-4">
                                      {/* Time input fields */}
                                      <div className="d-flex align-items-center me-3">
                                        <select
                                          className="form-select me-1"
                                          style={{ width: '70px' }}
                                          value={timeSlot.hour}
                                          onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'hour', e.target.value)}
                                        >
                                          {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                              {i.toString().padStart(2, '0')}
                                            </option>
                                          ))}
                                        </select>
                                        <span className="fw-bold me-1">:</span>
                                        <select
                                          className="form-select"
                                          style={{ width: '70px' }}
                                          value={timeSlot.minute}
                                          onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'minute', e.target.value)}
                                        >
                                          {Array.from({ length: 60 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                              {i.toString().padStart(2, '0')}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      
                                      {/* Action buttons */}
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm me-2"
                                        onClick={() => handleRemoveTimeSlot(day, timeSlot.id)}
                                        title="Eliminar franja horaria"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                      
                                      <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => handleAddTimeSlot(day)}
                                        title="Añadir franja horaria"
                                      >
                                        <i className="fas fa-plus"></i>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : availabilityPricingMode.availabilityMode === 'TIME_SLOTS' ? (
                        // Horario semanal estándar (franjas horarias)
                        <div className="mb-4">
                          <div className="mb-3">
                            <h5 className="fw-bold mb-0">
                              {getTranslation('stepSchedule.weeklySchedule.title', language)}
                            </h5>
                          </div>

                          <div className="row">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                              <div key={day} className="col-12 mb-3">
                                <div className="d-flex align-items-center mb-2">
                                  <span className="fw-semibold me-3" style={{ minWidth: '100px' }}>
                                    {getTranslation(`stepSchedule.weeklySchedule.${day}`, language)}
                                  </span>
                                  <button 
                                    type="button" 
                                    className="btn btn-link text-primary p-0"
                                    onClick={() => handleAddTimeSlot(day)}
                                  >
                                    <i className="fas fa-plus me-1"></i>
                                    {getTranslation('stepSchedule.weeklySchedule.addTimeSlot', language)}
                                  </button>
                                </div>
                                
                                {/* Display existing time slots */}
                                {(formData.timeSlots[day] || []).map((timeSlot) => (
                                  <div key={timeSlot.id} className="d-flex align-items-center mb-2 ms-4">
                                    {/* Time input fields */}
                                    <div className="d-flex align-items-center me-3">
                                      <select
                                        className="form-select me-1"
                                        style={{ width: '70px' }}
                                        value={timeSlot.hour}
                                        onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'hour', e.target.value)}
                                      >
                                        {Array.from({ length: 24 }, (_, i) => (
                                          <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                          </option>
                                        ))}
                                      </select>
                                      <span className="fw-bold me-1">:</span>
                                      <select
                                        className="form-select"
                                        style={{ width: '70px' }}
                                        value={timeSlot.minute}
                                        onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'minute', e.target.value)}
                                      >
                                        {Array.from({ length: 60 }, (_, i) => (
                                          <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm me-2"
                                      onClick={() => handleRemoveTimeSlot(day, timeSlot.id)}
                                      title="Eliminar franja horaria"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                    
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => handleAddTimeSlot(day)}
                                      title="Añadir franja horaria"
                                    >
                                      <i className="fas fa-plus"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // Horario semanal estilo apertura (OPENING_HOURS)
                        <div className="mb-4">
                          <div className="mb-3">
                            <h5 className="fw-bold mb-0">
                              Horario semanal estándar
                            </h5>
                          </div>

                          <div className="row">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                              <div key={day} className="col-12 mb-3">
                                <div className="d-flex align-items-center mb-2">
                                  <span className="fw-semibold me-3" style={{ minWidth: '100px' }}>
                                    {getTranslation(`stepSchedule.weeklySchedule.${day}`, language)}
                                  </span>
                                </div>
                                
                                {/* Mostrar franja horaria existente si existe */}
                                {(formData.timeSlots[day] || []).length > 0 ? (
                                  (formData.timeSlots[day] || []).map((timeSlot, index) => (
                                    <div key={timeSlot.id} className="d-flex align-items-center mb-2 ms-4">
                                      {/* Campos de hora de inicio */}
                                      <div className="d-flex align-items-center me-2">
                                        <select
                                          className="form-select me-1"
                                          style={{ width: '70px' }}
                                          value={timeSlot.hour}
                                          onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'hour', e.target.value)}
                                        >
                                          {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                              {i.toString().padStart(2, '0')}
                                            </option>
                                          ))}
                                        </select>
                                        <span className="fw-bold me-1">:</span>
                                        <select
                                          className="form-select me-2"
                                          style={{ width: '70px' }}
                                          value={timeSlot.minute}
                                          onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'minute', e.target.value)}
                                        >
                                          {Array.from({ length: 60 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                              {i.toString().padStart(2, '0')}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      
                                      {/* Separador */}
                                      <span className="fw-bold me-2">-</span>
                                      
                                      {/* Campos de hora de fin */}
                                      <div className="d-flex align-items-center me-3">
                                        <select
                                          className="form-select me-1"
                                          style={{ width: '70px' }}
                                          value={timeSlot.hour}
                                          onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'hour', e.target.value)}
                                        >
                                          {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                              {i.toString().padStart(2, '0')}
                                            </option>
                                          ))}
                                        </select>
                                        <span className="fw-bold me-1">:</span>
                                        <select
                                          className="form-select me-2"
                                          style={{ width: '70px' }}
                                          value={timeSlot.minute}
                                          onChange={(e) => handleTimeSlotChange(day, timeSlot.id, 'minute', e.target.value)}
                                        >
                                          {Array.from({ length: 60 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                              {i.toString().padStart(2, '0')}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      
                                      {/* Botón eliminar */}
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm me-2"
                                        onClick={() => handleRemoveTimeSlot(day, timeSlot.id)}
                                        title="Eliminar horario"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                      
                                      {/* Botón añadir horario de apertura */}
                                      <button
                                        type="button"
                                        className="btn btn-link text-primary p-0"
                                        onClick={() => handleAddTimeSlot(day)}
                                        title="Añadir horario de apertura"
                                      >
                                        <i className="fas fa-plus me-1"></i>
                                        Añadir horario de apertura
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  /* Si no hay franjas, mostrar solo el botón para añadir */
                                  <div className="ms-4">
                                    <button
                                      type="button"
                                      className="btn btn-link text-primary p-0"
                                      onClick={() => handleAddTimeSlot(day)}
                                      title="Añadir horario de apertura"
                                    >
                                      <i className="fas fa-plus me-1"></i>
                                      Añadir horario de apertura
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                                             {/* Información sobre el guardado */}
                       <div className="mb-4">
                         <div className="text-info border-0 bg-light">
                           <div className="d-flex align-items-start">
                             <i className="fas fa-info-circle text-primary me-2 mt-1"></i>
                             <div>
                               <p className="mb-0 text-muted">
                                 Al hacer clic en "Guardar y continuar", se guardará la configuración de horarios y tiempo de salida, y se avanzará al siguiente paso.
                               </p>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Excepciones */}
                       <div className="mb-4">
                        <h5 className="fw-bold mb-3">
                          {getTranslation('stepSchedule.exceptions.title', language)}
                        </h5>
                        <p className="text-muted mb-3">
                          {getTranslation('stepSchedule.exceptions.description', language)}
                        </p>

                        {formData.exceptions.map((exception, index) => (
                          <div key={index} className="row mb-3">
                            <div className="col-md-4">
                              <input
                                type="date"
                                className="form-control"
                                value={exception.date}
                                onChange={(e) => handleExceptionChange(index, 'date', e.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <input
                                type="text"
                                className="form-control"
                                placeholder={getTranslation('stepSchedule.exceptions.descriptionPlaceholder', language)}
                                value={exception.description}
                                onChange={(e) => handleExceptionChange(index, 'description', e.target.value)}
                              />
                            </div>
                            <div className="col-md-2">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleRemoveException(index)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ))}

                        <button 
                          type="button" 
                          className="btn btn-primary"
                          onClick={handleAddException}
                        >
                          <i className="fas fa-plus me-2"></i>
                          {getTranslation('stepSchedule.exceptions.addDate', language)}
                        </button>
                      </div>
                    </div>
                    ) : currentStep === 2 ? (
                     // Paso 2: Categorías de precios
                     <div>
                       <div className="d-flex justify-content-between align-items-center mb-4">
                         <h5 className="fw-bold mb-0">
                           Categorías de precios:
                         </h5>
                         <div className="d-flex align-items-center">
                           <span className="me-2">Mostrar ajustes avanzados</span>
                           <div className="form-check form-switch">
                             <input
                               className="form-check-input"
                               type="checkbox"
                               id="showAdvancedSettings"
                               checked={showAdvancedSettings}
                               onChange={(e) => setShowAdvancedSettings(e.target.checked)}
                             />
                           </div>
                         </div>
                       </div>
                       
                       <div className="mb-4">
                         <div className="form-check mb-3">
                           <input
                             className="form-check-input"
                             type="radio"
                             name="pricingType"
                             id="samePrice"
                             value="same"
                             checked={pricingType === 'same'}
                             onChange={(e) => setPricingType(e.target.value as 'same' | 'ageBased')}
                           />
                           <label className="form-check-label fw-semibold" htmlFor="samePrice">
                             El precio es igual para todos, por ejemplo: por participante
                           </label>
                         </div>
                         
                         <div className="form-check mb-3">
                           <input
                             className="form-check-input"
                             type="radio"
                             name="pricingType"
                             id="ageBasedPrice"
                             value="ageBased"
                             checked={pricingType === 'ageBased'}
                             onChange={(e) => setPricingType(e.target.value as 'same' | 'ageBased')}
                           />
                           <label className="form-check-label fw-semibold" htmlFor="ageBasedPrice">
                             El precio depende de la edad, por ejemplo: adultos, niños, mayores, etc
                           </label>
                         </div>
                       </div>

                       {/* Mostrar interfaz de grupos de edad solo si se selecciona "El precio depende de la edad" */}
                       {pricingType === 'ageBased' && (
                         <div className="mb-4">
                           
                           
                           {/* Mostrar orden actual de grupos */}
                           <div className="text-info border-0 bg-light mb-3">
                             <i className="fas fa-sort-numeric-up text-primary me-2"></i>
                             <strong>Orden actual:</strong> {
                               ageGroups
                                 .sort((a, b) => {
                                   const orderMap: { [key: string]: number } = {
                                     'Infante': 0,
                                     'Niños': 1,
                                     'Adultos': 2,
                                     'Adulto mayor': 3
                                   };
                                   return (orderMap[a.name] ?? 999) - (orderMap[b.name] ?? 999);
                                 })
                                 .map(group => group.name)
                                 .join(' → ')
                             }
                           </div>
                           
                            
                           
                           {ageGroups.map((group, index) => (
                             <div key={group.id} className="card mb-3 border">
                               <div className="card-body">
                                 <div className="d-flex justify-content-between align-items-center">
                                   <div className="d-flex align-items-center">
                                                                           <span className="fw-semibold me-3">
                                        {group.name}
                                        {(group.name === 'Niños' || group.name === 'Adultos') && (
                                          <span className="badge bg-info ms-2" style={{ fontSize: '0.7rem' }}>
                                            <i className="fas fa-shield-alt me-1"></i>
                                            Protegido
                                          </span>
                                        )}
                                      </span>
                                     <span className="text-muted me-2">Franja de edad</span>
                                     <div className="d-flex align-items-center">
                                       {/* Campos de edad - solo editable la edad máxima */}
                                       <div className="row g-2 mt-2">
                                         <div className="col-6">
                                           <input
                                             type="number"
                                             className="form-control form-control-sm"
                                             min="0"
                                             max="99"
                                             value={group.minAge}
                                             readOnly={true}
                                             style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                             title="La edad mínima se conecta automáticamente con la edad máxima del grupo anterior"
                                           />
                                         </div>
                                         <div className="col-6">
                                           <input
                                             type="number"
                                             className="form-control form-control-sm"
                                             min="0"
                                             max="99"
                                             value={group.maxAge}
                                             onChange={(e) => handleManualAgeRangeChange(group.id, 'maxAge', parseInt(e.target.value) || 0)}
                                             title="Edita la edad máxima para conectar automáticamente con el siguiente grupo"
                                           />
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                   <button
                                     type="button"
                                     className="btn btn-link text-danger p-0"
                                     onClick={() => handleRemoveAgeGroup(group.id)}
                                     disabled={ageGroups.length <= 1 || group.name === 'Niños' || group.name === 'Adultos'}
                                     title={group.name === 'Niños' || group.name === 'Adultos' ? 'Este grupo no se puede eliminar' : 'Eliminar grupo'}
                                   >
                                     Eliminar
                                   </button>
                                 </div>
                               </div>
                             </div>
                           ))}
                           
                           <button 
                             type="button" 
                             className="btn btn-link text-primary p-0 d-flex align-items-center"
                             onClick={handleAddAgeGroup}
                           >
                             <i className="fas fa-chevron-down me-2"></i>
                             Añadir grupo de edad
                           </button>
                           
                           {/* Información sobre grupos disponibles para agregar */}
                           <div className="mt-2">
                             {(() => {
                               const existingInfante = ageGroups.some(group => group.name === 'Infante');
                               const existingAdultoMayor = ageGroups.some(group => group.name === 'Adulto mayor');
                               
                               if (!existingInfante && !existingAdultoMayor) {
                                 return (
                                   <small className="text-muted">
                                     <i className="fas fa-info-circle me-1"></i>
                                     Puedes agregar: Infante y Adulto mayor
                                   </small>
                                 );
                               } else if (!existingInfante) {
                                 return (
                                   <small className="text-muted">
                                     <i className="fas fa-info-circle me-1"></i>
                                     Solo puedes agregar: Infante
                                   </small>
                                 );
                               } else if (!existingAdultoMayor) {
                                 return (
                                   <small className="text-muted">
                                     <i className="fas fa-info-circle me-1"></i>
                                     Solo puedes agregar: Adulto mayor
                                   </small>
                                 );
                               } else {
                                 return (
                                   <small className="text-success">
                                     <i className="fas fa-check-circle me-1"></i>
                                     Todos los grupos disponibles han sido agregados
                                   </small>
                                 );
                               }
                             })()}
                           </div>
                           
                           {/* Botón para continuar si ya se han configurado los grupos */}
                           {ageGroups.length > 0 && ageGroups.every(group => group.name.trim() && group.minAge < group.maxAge) && (
                             <div className="mt-4">
                               <button 
                                 type="button" 
                                 className="btn btn-primary"
                                 onClick={handleSaveAgeGroups}
                               >
                                 <i className="fas fa-arrow-right me-2"></i>
                                 Continuar al siguiente paso
                               </button>
                             </div>
                           )}
                           
                           {/* Mensaje de validación */}
                           {ageGroups.length > 0 && (
                             <div className="mt-3">
                               {(() => {
                                 const validation = validateAgeRanges(ageGroups);
                                 return validation.errors.map((error, index) => (
                                   <div key={index} className="text-warning" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                     <i className="fas fa-exclamation-triangle me-2"></i>
                                     {error}
                                   </div>
                                 ));
                               })()}
                             </div>
                           )}
                         </div>
                       )}
                       
                       {/* Botón para continuar cuando se selecciona precio igual para todos */}
                       {pricingType === 'same' && (
                         <div className="mt-4">
                           <button 
                             type="button" 
                             className="btn btn-primary"
                             onClick={() => {
                               localStorage.setItem(`${storageKey}_pricingType`, pricingType);
                               navigate(`/extranet/activity/availabilityPricing/create?step=3&optionId=${optionId}&lang=${lang}&currency=${currency}`);
                             }}
                           >
                             <i className="fas fa-arrow-right me-2"></i>
                             Continuar al siguiente paso
                           </button>
                         </div>
                       )}
                       
                       {/* Botones de navegación para step 2 */}
                       <div className="d-flex justify-content-between mt-5">
                         <button 
                           type="button" 
                           className="btn btn-outline-primary"
                           onClick={handleBack}
                         >
                           <i className="fas fa-arrow-left me-2"></i>
                           Atrás
                         </button>
                       </div>
                       
                       
                     </div>
                     ) : currentStep === 3 ? (
                      // Paso 3: Capacidad
                      availabilityPricingMode && availabilityPricingMode.pricingMode === 'PER_PERSON' ? (
                        <div>
                          <h5 className="fw-bold mb-4 text-dark">
                            Veamos la capacidad
                          </h5>
                          
                          <h6 className="fw-bold mb-4 text-dark">
                            ¿Cuántos participantes puedes aceptar por franja horaria?
                          </h6>
                          
                          <div className="row">
                            <div className="d-flex flex-column">
                            <div className="col-md-4 mb-4 d-flex justify-content-start">
                              <label htmlFor="minParticipants" className="form-label text-muted d-flex align-items-center">
                                  Número mínimo de participantes
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="minParticipants"
                                min="1"
                                defaultValue="1"
                              />
                            </div>
                            
                            <div className="col-md-4 mb-4 d-flex justify-content-start">
                              <label htmlFor="maxParticipants" className="form-label text-muted">
                                Número máximo de participantes
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="maxParticipants"
                                min="1"
                              />
                            </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-center py-5">
                            <div className="text-muted">
                              <i className="fas fa-info-circle fa-3x mb-3"></i>
                              <h5 className="text-muted">Configuración no disponible</h5>
                              <p className="text-muted">
                                La configuración de capacidad solo está disponible cuando el modo de precios es "Por persona".
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                     ) : currentStep === 4 ? (
                       // Paso 4: Precio
                       <div>
                         <h5 className="fw-bold mb-4 text-dark">
                           Establece el precio de tu actividad
                         </h5>
                         
                         <h6 className="fw-bold mb-4 text-dark">
                           Participante
                         </h6>
                         
                         <div className="row">
                           <div className="col-md-3 mb-4">
                             <label className="form-label text-muted">
                               Número de personas
                             </label>
                             <div className="d-flex align-items-center">
                               <span className="text-muted me-2">1 a 20</span>
                               <i className="fas fa-info-circle text-muted" style={{ fontSize: '14px' }}></i>
                             </div>
                           </div>
                           
                           <div className="col-md-3 mb-4">
                             <label className="form-label text-muted">
                               El cliente paga
                             </label>
                             <input
                               type="text"
                               className="form-control"
                               placeholder="USD"
                             />
                           </div>
                           
                           <div className="col-md-3 mb-4">
                             <label className="form-label text-muted">
                               Comisión
                             </label>
                             <input
                               type="text"
                               className="form-control"
                               value="30%"
                               readOnly
                             />
                           </div>
                           
                           <div className="col-md-3 mb-4">
                             <label className="form-label text-muted">
                               Precio por participante
                             </label>
                             <input
                               type="text"
                               className="form-control"
                               placeholder=""
                             />
                           </div>
                         </div>
                         
                         <div className="mt-4">
                           <button 
                             type="button" 
                             className="btn btn-link text-primary p-0 d-flex align-items-center"
                           >
                             <i className="fas fa-plus me-2"></i>
                             Precio por nivel
                           </button>
                         </div>
                       </div>
                        ) : currentStep === 5 ? (
                        // Paso 5: Actividades complementarias (opcional)
                        <div>
                          <h5 className="fw-bold mb-4 text-dark">
                            Actividades complementarias (opcional)
                          </h5>
                          
                          <h6 className="fw-bold mb-4 text-dark">
                            ¿Qué es una actividad complementaria?
                          </h6>
                          
                          <p className="text-muted mb-4">
                            Ofrece servicios o elementos adicionales para tus actividades con el fin de mejorar la experiencia de los viajeros.
                          </p>
                          
                          <div className="d-flex justify-content-center mb-4">
                            <div className="input-group" style={{ maxWidth: '400px' }}>
                              <span className="input-group-text bg-white border-end-0">
                                <i className="fas fa-search text-muted"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search..."
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Error para valores de step no válidos
                        <div className="mb-5">
                                                  <div className="text-danger border-0">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-exclamation-triangle me-3 text-danger"></i>
                            <div>
                              <h5 className="alert-heading text-danger mb-2">
                                Paso no válido
                              </h5>
                              <p className="mb-0 text-danger">
                                El valor del paso "{currentStep}" no es válido. Solo se permiten pasos del 1 al 5.
                              </p>
                            </div>
                          </div>
                        </div>
                        </div>
                      )}
                {/* Botones de navegación */}
                {currentStep !== 2 && (
                  <div className="d-flex justify-content-between mt-5">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={handleBack}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      {getTranslation('stepSchedule.buttons.back', language)}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleSaveAndContinue}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          {getTranslation('stepSchedule.buttons.saveAndContinue', language)}
                          <i className="fas fa-arrow-right ms-2"></i>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OptionSetupLayout>
  );
}
