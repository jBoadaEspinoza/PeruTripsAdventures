import { apiGet } from './apiConfig';
import { apiPost } from './apiConfig';
import { getRuc } from '../utils/configUtils';

export interface ActivityImage {
  id: number;
  imageUrl: string;
  isCover: boolean;
}

export interface Schedule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BookingOption {
  id: string;
  title: string;
  durationHours: number;
  durationMinutes: number;
  groupMinSize: number;
  groupMaxSize: number;
  isPrivate: boolean;
  includesFood: boolean;
  meetingType: string;
  meetingPointDescription: string[];
  meetingPointAddress: string | null;
  meetingPointLatitude: number | null;
  meetingPointLongitude: number | null;
  returnToMeetingPoint: boolean;
  meetingPointId: number;
  meetingPointCity: string;
  meetingPointCountry: string;
  arrivalType: string;
  arrivalInstruction: string;
  dropoffDescription: string;
  languages: string[];
  pricingMode: string;
  pricePerPerson: number;
  currency: string;
  requiresEntryTicket: boolean;
  entryTicketType: string | null;
  hasMinAge: boolean;
  minAge: number | null;
  availableOnSite: boolean;
  isOpenDuration: boolean;
  validityDays: number | null;
  defaultCutoffMinutes: number;
  lastMinuteAfterFirst: boolean;
  customCutoffBySchedule: boolean;
  isActive: boolean;
  schedules: Schedule[];
}

export interface Activity {
  id: string;
  title: string;
  presentation: string;
  description: string[];
  recommendations: string[];
  restrictions: string[];
  includes: string[];
  notIncludes: string[];
  includesFood: boolean;
  usesTransport: boolean;
  crossesCities: boolean;
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
  categoryIsActive: boolean;
  guidanceTypeId: number;
  guidanceTypeCode: string;
  guidanceTypeName: string;
  guidanceTypeDescription: string;
  guidanceTypeIsActive: boolean;
  bookingOptions: BookingOption[];
  images: ActivityImage[];
  itineraries?: any[]; // Campo opcional para itinerarios
  createAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface SearchResponse {
  success: boolean;
  data: Activity[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
  nextPage: number;
}

export interface Destination {
  id: number;
  cityName: string;
  countryId: string;
  latitude: number;
  longitude: number;
  active: boolean;
  activityCount: number;
  imageUrl?: string;
}

export interface DestinationsResponse {
  success: boolean;
  data: Destination[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
}

export interface SearchParams {
  destinationCity?: string;
  destination?: string; // Para filtrar por destino
  searchTerm?: string; // Para búsqueda por término
  lang?: string;
  companyId?: string;
  page?: number;
  size?: number;
  currency?: string;
  includeBookingOptions?: boolean;
}

export interface CreateCategoryRequest {
  categoryId: number;
}

export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  idCreated: string;
}

export interface CreateTitleRequest {
  id: string;
  title: string;
  lang: string;
}

export interface CreateTitleResponse {
  success: boolean;
  message: string;
}

export interface CreateDescriptionRequest {
  id: string;
  presentation: string;
  description: string;
  lang: string;
}

export interface CreateDescriptionResponse {
  success: boolean;
  message: string;
}

export interface CreateRecommendationsRequest {
  id: string;
  recommendations: string[];
  lang: string;
}

export interface CreateRecommendationsResponse {
  success: boolean;
  message: string;
}

export interface CreateRestrictionsRequest {
  id: string;
  restrictions: string[];
  lang: string;
}

export interface CreateRestrictionsResponse {
  success: boolean;
  message: string;
}

export interface CreateIncludesRequest {
  id: string;
  inclusions: string[];
  lang: string;
}

export interface CreateIncludesResponse {
  success: boolean;
  message: string;
}

export interface CreateNotIncludesRequest {
  id: string;
  notInclusions: string[];
  lang: string;
}

export interface CreateNotIncludesResponse {
  success: boolean;
  message: string;
}

export interface ActivityImageData{
  url: string;
  cover?: boolean;
}

export interface CreateImagesRequest{
  id: String;
  images: ActivityImageData[];
}

export interface CreateImagesResponse{
  success: boolean;
  message: string;
}

export interface GetActivityByIdRequest {
  activityId: string;
  lang: string;
}

export interface GetActivityByIdResponse {
  success: boolean;
  data?: Activity;
  message?: string;
}

export const activitiesApi = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    try {
      const searchParams = {
        ...params,
        companyId: getRuc()
      };
      
      console.log('ctivities API: Search params:', searchParams);
      const response = await apiGet<SearchResponse>('/activities/search', { params: searchParams });
      return response;
    } catch (error: any) {
      console.error('Activities API: Error fetching activities:', error);
      
      // Retornar una respuesta de error en lugar de lanzar la excepción
      return {
        success: false,
        data: [],
        totalElements: 0,
        totalPages: 0,
        pageSize: params.size || 10,
        currentPage: params.page || 0,
        nextPage: 0
      };
    }
  },

  getById: async (id: string, lang: string = 'es', currency: string = 'PEN'): Promise<Activity> => {
    try {
      const url = `/activities/search/${id}`;
      const params = { lang, currency, companyId: getRuc() };
      
      const response = await apiGet<any>(url, { params });
      
      // Handle different response structures
      if (response && response.data) {
        // If response has a data property, return that
        return response.data;
      } else if (response) {
        // If response is the data directly
        return response;
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('Error fetching activity:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  getDestinations: async (page: number = 0, size: number = 10, sortBy: string = 'cityName', sortDirection: string = 'ASC'): Promise<DestinationsResponse> => {
    try {
      const params = { page, size, sortBy, sortDirection, companyId: getRuc() };
      
      const response = await apiGet<DestinationsResponse>('/activities/destinations', { params });
      return response;
    } catch (error: any) {
      console.error('Error fetching destinations:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      // Retornar una respuesta de error en lugar de lanzar la excepción
      return {
        success: false,
        data: [],
        totalElements: 0,
        totalPages: 0,
        pageSize: size,
        currentPage: page
      };
    }
  },

  createCategory: async (request: CreateCategoryRequest): Promise<CreateCategoryResponse> => {
    try {
      console.log('Activities API: Creating category with request:', request);
      const response = await apiPost<CreateCategoryResponse>('/activities/createCategory', request);
      console.log('Activities API: Raw response:', response);
      
      // Validar que la respuesta tenga la estructura esperada
      if (response && typeof response === 'object') {
        // Si la respuesta tiene la estructura correcta, devolverla
        if ('success' in response && 'idCreated' in response) {
          return response as CreateCategoryResponse;
        }
        // Si la respuesta no tiene la estructura esperada, intentar extraer los datos
        console.warn('Activities API: Response structure unexpected:', response);
        
        // Intentar extraer los datos de la respuesta
        const responseAny = response as any;
        if (responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data) {
          return responseAny.data as CreateCategoryResponse;
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Activities API: Error creating activity category:', error);
      
      // Retornar una respuesta de error en lugar de lanzar la excepción
      return {
        success: false,
        message: 'Error al crear la actividad',
        idCreated: ''
      };
    }
  },
  createTitle: async (request: CreateTitleRequest): Promise<CreateTitleResponse> => {
    try {
      const response = await apiPost<CreateTitleResponse>('/activities/createTitle', request);
      
      // Validar que la respuesta tenga la estructura esperada
      if (response && typeof response === 'object') {
        // Si la respuesta tiene la estructura correcta, devolverla
        if ('success' in response && 'message' in response) {
          return response as CreateTitleResponse;
        }
        
        // Intentar extraer los datos de la respuesta
        const responseAny = response as any;
        if (responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data) {
          return responseAny.data as CreateTitleResponse;
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Activities API: Error creating activity title:', error);
      
      // Retornar una respuesta de error en lugar de lanzar la excepción
      return {
        success: false,
        message: 'Error al crear el título de la actividad'
      };
    }
  },
  createDescription: async (request: CreateDescriptionRequest): Promise<CreateDescriptionResponse> => {
    try {
      const response = await apiPost<CreateDescriptionResponse>('/activities/createDescription', request);
      
      if (response && typeof response === 'object') {
        if ('success' in response && 'message' in response) {
          return response as CreateDescriptionResponse;
        }
        
        const responseAny = response as any;
        if (responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data) {
          return responseAny.data as CreateDescriptionResponse;
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Activities API: Error creating activity description:', error);
      
      return {
        success: false,
        message: 'Error al crear descripción de la actividad'
      };
    }
  },
  createRecommendations: async (request: CreateRecommendationsRequest): Promise<CreateRecommendationsResponse> => {
    try {
      const response = await apiPost<CreateRecommendationsResponse>('/activities/createRecommendations', request);
      
      if (response && typeof response === 'object') {
        if ('success' in response && 'message' in response) {
          return response as CreateRecommendationsResponse;
        }
        
        const responseAny = response as any;
        if (responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data) {
          return responseAny.data as CreateRecommendationsResponse;
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Activities API: Error creating activity recommendations:', error);
      
      return {
        success: false,
        message: 'Error al crear recomendaciones de la actividad'
      };
    }
  },
  createRestrictions: async (request: CreateRestrictionsRequest): Promise<CreateRestrictionsResponse> => {
    try {
      const response = await apiPost<CreateRestrictionsResponse>('/activities/createRestrictions', request);
      
      if (response && typeof response === 'object') {
        if ('success' in response && 'message' in response) {
          return response as CreateRestrictionsResponse;
        }
        
        const responseAny = response as any;
        if (responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data) {
          return responseAny.data as CreateRestrictionsResponse;
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Activities API: Error creating activity restrictions:', error);
      
      return {
        success: false,
        message: 'Error al crear restricciones de la actividad'
      };
    }
  },
  createIncludes: async (request: CreateIncludesRequest): Promise<CreateIncludesResponse> => {
    try {
      const response = await apiPost<CreateIncludesResponse>('/activities/createInclusions', request);
      if(response && typeof response === 'object'){
        if('success' in response && 'message' in response){
          return response as CreateIncludesResponse;
        }
        const responseAny = response as any;
        if(responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data){
          return responseAny.data as CreateIncludesResponse;
        }
      }
      return response;
    } catch (error: any) {
      console.error('Activities API: Error creating activity includes:', error);
      
      return {
        success: false,
        message: 'Error al crear includes de la actividad'
      };
    }
  },
  createNotIncludes: async (request: CreateNotIncludesRequest): Promise<CreateNotIncludesResponse> => {
    try {
      const response = await apiPost<CreateNotIncludesResponse>('/activities/createNotInclusions', request);
      if(response && typeof response === 'object'){
        if('success' in response && 'message' in response){
          return response as CreateNotIncludesResponse;
        }
        const responseAny = response as any;
        if(responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data){
          return responseAny.data as CreateNotIncludesResponse;
        }
      }
      return response;
    } catch (error: any) {
      console.error('Activities API: Error creating activity not includes:', error);
      
      return {
        success: false,
        message: 'Error al crear not includes de la actividad'
      };
    }
  },
  getActivityById: async (request: GetActivityByIdRequest): Promise<GetActivityByIdResponse> => {
    try {
      const response = await apiGet<GetActivityByIdResponse>(`/activities/${request.activityId}?lang=${request.lang}`);
      
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          return response as GetActivityByIdResponse;
        }
        
        const responseAny = response as any;
        if (responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data) {
          return responseAny.data as GetActivityByIdResponse;
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Activities API: Error getting activity by ID:', error);
      
      return {
        success: false,
        message: 'Error al obtener la actividad'
      };
    }
  },
  createImages: async (request: CreateImagesRequest): Promise<CreateImagesResponse> => {
    try{
      const response = await apiPost<CreateImagesResponse>('/activities/createImages', request);
      if(response && typeof response === 'object'){
        if('success' in response && 'message' in response){
          return response as CreateImagesResponse;
        }
        const responseAny = response as any;
        if(responseAny && typeof responseAny === 'object' && 'data' in responseAny && responseAny.data){
          return responseAny.data as CreateImagesResponse;
        }
      }
      return response;
    }
    catch(error: any){
      console.error('Activities API: Error creating activity images:', error);
      return {
        success: false,
        message: 'Error al crear imagenes de la actividad'
      };
    }
  }

}; 