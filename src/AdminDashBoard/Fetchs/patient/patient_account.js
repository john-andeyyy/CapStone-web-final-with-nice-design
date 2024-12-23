import axios from 'axios';

export const fetchPatients = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_BASEURL}/Patient/auth/getAllPatients`,
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching patients:', error);
    }
};



