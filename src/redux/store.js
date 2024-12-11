import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './patientSlice';

const store = configureStore({
    reducer: {
        patients: patientReducer,
    },
});

export default store;
