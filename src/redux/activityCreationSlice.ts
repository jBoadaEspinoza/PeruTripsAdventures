import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ActivityCreationState {
  activityId: string | null;
  selectedCategory: {
    id: number;
    name: string;
  } | null;
  currentStep: number;
  totalSteps: number;
}

// Clave para localStorage
const STORAGE_KEY = 'activityCreationState';

// Función para cargar estado desde localStorage
const loadStateFromStorage = (): Partial<ActivityCreationState> => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return {};
  }
};

// Función para guardar estado en localStorage
const saveStateToStorage = (state: ActivityCreationState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

const initialState: ActivityCreationState = {
  activityId: null,
  selectedCategory: null,
  currentStep: 1,
  totalSteps: 10,
  ...loadStateFromStorage() // Cargar estado guardado
};

const activityCreationSlice = createSlice({
  name: 'activityCreation',
  initialState,
  reducers: {
    setActivityId: (state, action: PayloadAction<string>) => {
      state.activityId = action.payload;
      saveStateToStorage(state); // Guardar al cambiar
    },
    setSelectedCategory: (state, action: PayloadAction<{ id: number; name: string }>) => {
      state.selectedCategory = action.payload;
      saveStateToStorage(state); // Guardar al cambiar
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      saveStateToStorage(state); // Guardar al cambiar
    },
    resetActivityCreation: (state) => {
      state.activityId = null;
      state.selectedCategory = null;
      state.currentStep = 1;
      saveStateToStorage(state); // Guardar al cambiar
    },
    clearActivityCreation: (state) => {
      state.activityId = null;
      state.selectedCategory = null;
      state.currentStep = 1;
      saveStateToStorage(state); // Guardar al cambiar
    }
  }
});

export const {
  setActivityId,
  setSelectedCategory,
  setCurrentStep,
  resetActivityCreation,
  clearActivityCreation
} = activityCreationSlice.actions;

export default activityCreationSlice.reducer; 