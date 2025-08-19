import { apiGet } from './apiConfig';
import { apiPost } from './apiConfig';
import { getRuc } from '../utils/configUtils';

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
    }
}