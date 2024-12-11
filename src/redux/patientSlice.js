import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPatients } from '../AdminDashBoard/Fetchs/patient/patient_account';

// Create an async thunk for fetching patients
export const fetchPatientData = createAsyncThunk(
    'patients/fetchPatientData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchPatients();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const patientSlice = createSlice({
    name: 'patients',
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPatientData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPatientData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.sort((a, b) =>
                    a.LastName.toLowerCase().localeCompare(b.LastName.toLowerCase())
                );
            })
            .addCase(fetchPatientData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default patientSlice.reducer;
