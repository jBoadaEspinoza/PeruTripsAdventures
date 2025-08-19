import { apiGet } from './apiConfig';

export interface Place {
    id: number;
    cityName: string;
    countryId: string;
    latitude: number;
    longitude: number;
    active: boolean;
    activityCount: number;
    imageUrl?: string;
}

export const placesApi = {
    getPlaces: async (): Promise<Place[]> => {
        try {
            const response = await apiGet<Place[]>('/places');
            
            // Handle different response formats
            if (Array.isArray(response)) {
                return response;
            }
            
            // If response has a data property, extract it
            if (response && typeof response === 'object' && 'data' in response) {
                const data = (response as any).data;
                if (Array.isArray(data)) {
                    return data;
                }
            }
            
            // If response has success property and is false, throw error
            if (response && typeof response === 'object' && 'success' in response && !(response as any).success) {
                throw new Error((response as any).message || 'Error al cargar las ciudades');
            }
            
            // Fallback: return empty array if response format is unexpected
            console.warn('Unexpected response format from places API:', response);
            return [];
            
        } catch (error) {
            console.error('Error fetching places:', error);
            throw new Error('Error al cargar las ciudades disponibles');
        }
    }
}
