// npm test ServicesList.test.js
import { fetchData } from '../utils/ServiceList';
import axios from 'axios';

// Mocking axios
jest.mock('axios');

describe('fetchData', () => {
    let mockSetData;
    let mockSetLoading;
    let mockSetError;

    beforeEach(() => {
        mockSetData = jest.fn();
        mockSetLoading = jest.fn();
        mockSetError = jest.fn();
    });

    it('should set data correctly when fetch is successful', async () => {
        const mockData = [
            { id: 1, name: 'Tooth Extraction', available: true },
            { id: 2, name: 'Teeth Contouring', available: true },
            { id: 3, name: 'Dental X-rays', available: true }
        ];

        axios.get.mockResolvedValue({ data: mockData });

        // Call the function
        await fetchData(mockSetData, mockSetLoading, mockSetError, false, null);

        expect(mockSetData).toHaveBeenCalledWith(mockData);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
        expect(mockSetError).not.toHaveBeenCalled();
    });

    it('should set error correctly when fetch fails', async () => {
        const mockError = new Error('Failed to fetch');

        axios.get.mockRejectedValue(mockError);

        // Call the function
        await fetchData(mockSetData, mockSetLoading, mockSetError, false, null);

        expect(mockSetError).toHaveBeenCalledWith(mockError);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
        expect(mockSetData).not.toHaveBeenCalled();
    });

    it('should fetch data again when refresh is true', async () => {
        const mockData = [
            { id: 1, name: 'Tooth Extraction', available: true },
            { id: 2, name: 'Teeth Contouring', available: true },
            { id: 3, name: 'Dental X-rays', available: true }
        ];

        axios.get.mockResolvedValue({ data: mockData });

        // Call the function when `refresh` is true
        await fetchData(mockSetData, mockSetLoading, mockSetError, true, { id: 1 });

        expect(mockSetData).toHaveBeenCalledWith(mockData);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
        expect(mockSetError).not.toHaveBeenCalled();
    });

    it('should not fetch data if data is already present and refresh is false', async () => {
        const mockData = [
            { id: 1, name: 'Tooth Extraction', available: true },
            { id: 2, name: 'Teeth Contouring', available: true },
            { id: 3, name: 'Dental X-rays', available: true }
        ];

        // Simulate that data is already present
        await fetchData(mockSetData, mockSetLoading, mockSetError, false, mockData);

        // Ensure setData was not called again
        expect(mockSetData).not.toHaveBeenCalled();
        expect(mockSetLoading).toHaveBeenCalledWith(false);
        expect(mockSetError).not.toHaveBeenCalled();
    });

    it('should handle empty response data correctly', async () => {
        const emptyData = [];

        axios.get.mockResolvedValue({ data: emptyData });

        // Call the function
        await fetchData(mockSetData, mockSetLoading, mockSetError, false, null);

        expect(mockSetData).toHaveBeenCalledWith(emptyData);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
        expect(mockSetError).not.toHaveBeenCalled();
    });

    it('should call setLoading correctly during the data fetch', async () => {
        const mockData = [
            { id: 1, name: 'Tooth Extraction', available: true },
            { id: 2, name: 'Teeth Contouring', available: true },
            { id: 3, name: 'Dental X-rays', available: true }
        ];

        axios.get.mockResolvedValue({ data: mockData });

        // Call the function and verify setLoading behavior
        const fetchPromise = fetchData(mockSetData, mockSetLoading, mockSetError, false, null);

        expect(mockSetLoading).toHaveBeenCalledWith(true); // Loading should be true before data is fetched

        await fetchPromise; // Wait for the async operation to complete

        expect(mockSetLoading).toHaveBeenCalledWith(false); // Loading should be false after data is fetched
    });
});

