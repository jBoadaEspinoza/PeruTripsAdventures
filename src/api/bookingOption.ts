import { apiGet } from './apiConfig';
import { apiPost } from './apiConfig';
import { getRuc } from '../utils/configUtils';

export interface BookingOptionCreateAvailabilityPricingDepartureTimeRequest {
    activityId: string; // requerido
    bookingOptionId: string; // requerido
    title: string; // requerido, máx 50 caracteres
    lang: string; // requerido
    startDate: string; // ISO date (yyyy-MM-dd)
    endDate?: string; // opcional (yyyy-MM-dd)
    weeklySchedule: WeeklyScheduleRequest[]; // requerido
    exceptions?: ScheduleExceptionRequest[]; // opcional
}

export interface WeeklyScheduleRequest {
    dayOfWeek: number; // 0=Lunes, 1=Martes, etc.
    startTime: string; // HH:mm
    endTime?: string; // opcional HH:mm
}

export interface ScheduleExceptionRequest {
    date: string; // ISO date (yyyy-MM-dd)
    description: string; // requerido
}

export interface CreateBookingOptionAvailabilityPricingDepartureTimeResponse{
    success: boolean;
    message: string;
    idCreated: string;
}

export interface AvailabilityPricingMode{
    availabilityMode: string; // "TIME_SLOTS" | "OPENING_HOURS"
    pricingMode: string; // "PER_PERSON" | "PER_GROUP"
}

export interface ApiErrorResponse {
    success: false;
    errorCode: string;
    message: string;
}

export interface BookingPickupPointRequest {
    cityId: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    notes: string;
}
export interface CreateBookingOptionAvailabilityPricingRequest {
    activityId: string;
    bookingOptionId: string; 
    availabilityMode: string; // "TIME_SLOTS" | "OPENING_HOURS"
    pricingMode: string; // "PER_PERSON" | "PER_GROUP"
}
export interface CreateBookingOptionMeetingPickupRequest {
    activityId: string;
    bookingOptionId: string;
    lang: string;
    meetingType: string; // "MEETING_POINT" | "PICKUP_ZONE" | "REFERENCE_CITY_WITH_LIST"

    // Meeting Point
    meetingPointId?: number;
    meetingPointAddress?: string;
    meetingPointLatitude?: number;
    meetingPointLongitude?: number;
    meetingPointDescription?: string;

    // Pickup Points (solo si meetingType = REFERENCE_CITY_WITH_LIST)
    pickupPoints?: BookingPickupPointRequest[];

    // Pickup Config
    pickupNotificationWhen?: "AT_BOOKING" | "DAY_BEFORE" | "24H_BEFORE" | "AT_START_TIME";
    pickupTimeOption?: "SAME_AS_START" | "30_MIN_BEFORE" | "60_MIN_BEFORE" | "90_MIN_BEFORE" | "120_MIN_BEFORE" | "CUSTOM";
    customPickupMinutes?: number;

    // Dropoff Config
    dropoffType?: "SAME_AS_PICKUP" | "DIFFERENT_LOCATION" | "NO_DROPOFF";
    dropoffLocationId?: number;

    // Transport
    transportModeId?: number;
}

export interface CreateBookingOptionMeetingPickupResponse{
    success: boolean;
    message: string;
    idCreated: string;
}

export interface CreateBookingOptionRequest{
    activityId: string;
}

export interface CreateBookingOptionSetupRequest{
    activityId: string;            
    bookingOptionId: string;       
    title: string;                 
    maxGroupSize?: number | null;  

    guideLanguages: string[];      
    isPrivate: boolean;            
    isOpenDuration: boolean;       

    durationDays?: number | null;
    durationHours?: number | null;
    durationMinutes?: number | null;
    validityDays?: number | null;
}

export interface CreateBookingOptionResponse{
    success: boolean;
    message: string;
    idCreated: string;
}

export interface CreateBookingOptionSetupResponse{
    success: boolean;
    message: string;
    idCreated: string;
}

export interface CreateBookingOptionAvailabilityPricingResponse{
    success: boolean;
    message: string;
    idCreated: string;
}
export const bookingOptionApi = {
    create: async (request: CreateBookingOptionRequest): Promise<CreateBookingOptionResponse> => {
        try {
            const response = await apiPost<CreateBookingOptionResponse>('/booking-options/create', request);
            if(response && typeof response === 'object'){
                if('success' in response && 'idCreated' in response){
                    return response as CreateBookingOptionResponse;
                }
            }
            const responseAny = response as any;
            if(responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data){
                return responseAny.data as CreateBookingOptionResponse;
            }
            return response;
        } catch (error: any) {
            console.error('Booking Option API: Error creating booking option:', error);
            return {
                success: false,
                message: 'Error al crear la opción de reserva',
                idCreated: ''
            }
        }
    },
    createSetup: async (request: CreateBookingOptionSetupRequest): Promise<CreateBookingOptionSetupResponse> => {
        try {
            const response = await apiPost<CreateBookingOptionSetupResponse>('/booking-options/createSetup', request);
            if(response && typeof response === 'object'){
                if('success' in response && 'idCreated' in response){
                    return response as CreateBookingOptionSetupResponse;
                }
            }
            const responseAny = response as any;
            if(responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data){
                return responseAny.data as CreateBookingOptionSetupResponse;
            }
            return response;
        } catch (error: any) {
            console.error('Booking Option API: Error creating booking option setup:', error);
            return {
                success: false,
                message: 'Error al crear la configuración de la opción de reserva',
                idCreated: ''
            };
        }
    },
    createBookingOptionMeetingPickup: async (request: CreateBookingOptionMeetingPickupRequest): Promise<CreateBookingOptionMeetingPickupResponse> => {
        try{
            const response = await apiPost<CreateBookingOptionMeetingPickupResponse>('/booking-options/createMeetingPickup', request);
            if(response && typeof response === 'object'){
                if('success' in response && 'idCreated' in response){
                    return response as CreateBookingOptionMeetingPickupResponse;
                }
            }
            const responseAny = response as any;
            if(responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data){
                return responseAny.data as CreateBookingOptionMeetingPickupResponse;
            }
            return response;
        }catch(error: any){
            console.error('Booking Option API: Error creating booking option meeting pickup:', error);
            return {
                success: false,
                message: 'Error al crear la opción de reserva',
                idCreated: ''
            }
        }
    },
    createBookingOptionAvailabilityPricing: async (request: CreateBookingOptionAvailabilityPricingRequest): Promise<CreateBookingOptionAvailabilityPricingResponse> => {
        try{
            const response = await apiPost<CreateBookingOptionAvailabilityPricingResponse>('/booking-options/createAvailabilityPricing', request);
            if(response && typeof response === 'object'){
                if('success' in response && 'idCreated' in response){
                    return response as CreateBookingOptionAvailabilityPricingResponse;
                }
            }
            const responseAny = response as any;
            if(responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data){
                return responseAny.data as CreateBookingOptionAvailabilityPricingResponse;
            }
            return response;
        }catch(error: any){
            console.error('Booking Option API: Error creating booking option availability pricing:', error);
            return {
                success: false,
                message: 'Error al crear la opción de reserva',
                idCreated: ''
            }
        }
    },
    getAvailabilityPricingMode: async (bookingOptionId: string): Promise<AvailabilityPricingMode | ApiErrorResponse> => {
        try {
            const response = await apiGet<AvailabilityPricingMode | ApiErrorResponse>(`/booking-options/${bookingOptionId}/getAvailabilityPricingMode`);
            
            // Si la respuesta indica un error (success: false)
            if (response && typeof response === 'object' && 'success' in response && response.success === false) {
                return response as ApiErrorResponse;
            }
            
            // Validar que la respuesta tenga la estructura correcta de AvailabilityPricingMode
            if (response && typeof response === 'object' && 'availabilityMode' in response && 'pricingMode' in response) {
                return response as AvailabilityPricingMode;
            }
            
            // Si la respuesta no tiene la estructura esperada, verificar si está en data
            if (response && typeof response === 'object' && 'data' in response) {
                const responseAny = response as any;
                if (responseAny.data && typeof responseAny.data === 'object' && 'availabilityMode' in responseAny.data && 'pricingMode' in responseAny.data) {
                    return responseAny.data as AvailabilityPricingMode;
                }
            }
            
            // Si no se puede determinar la estructura, retornar error genérico
            console.warn('Booking Option API: Response does not match expected structure:', response);
            return {
                success: false,
                errorCode: 'INVALID_RESPONSE_STRUCTURE',
                message: 'La respuesta del servidor no tiene la estructura esperada'
            };
        } catch (error: any) {
            console.error('Booking Option API: Error getting availability pricing mode:', error);
            return {
                success: false,
                errorCode: 'NETWORK_ERROR',
                message: 'Error de conexión al obtener el modo de disponibilidad y precios'
            };
        }
    },
    createAvailabilityPricingDepartureTime: async (request: BookingOptionCreateAvailabilityPricingDepartureTimeRequest): Promise<CreateBookingOptionAvailabilityPricingDepartureTimeResponse> => {
        try{
            const response = await apiPost<CreateBookingOptionAvailabilityPricingDepartureTimeResponse>('/booking-options/createAvailabilityPricingDepartureTime', request);
            if(response && typeof response === 'object'){
                if('success' in response && 'idCreated' in response){
                    return response as CreateBookingOptionAvailabilityPricingDepartureTimeResponse;
                }
            }
            const responseAny = response as any;
            if(responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data){
                return responseAny.data as CreateBookingOptionAvailabilityPricingDepartureTimeResponse;
            }
            return response;
        }catch(error: any){
            console.error('Booking Option API: Error creating booking option availability pricing departure time:', error);
            return {
                success: false,
                message: 'Error al crear la opción de reserva',
                idCreated: ''
            }
        }
    }
}