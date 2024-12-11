import axios from 'axios';

const Baseurl = process.env.VITE_BASEURL || 'http://localhost:300'; 
const ApiUrl = `Procedure/showwithimage`;

export const fetchData = async (setData, setLoading, setError, refresh, data) => {
    try {
        if (!data || refresh) {
            setLoading(true);
            const response = await axios.get(`${Baseurl}/${ApiUrl}`);
            setData(response.data);
        }
    } catch (err) {
        setError(err);
        // console.error('Error fetching ServicesList:', err);
    } finally {
        setLoading(false);
    }
};
