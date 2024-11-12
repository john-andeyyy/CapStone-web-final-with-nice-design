import { useState, useEffect } from 'react';
import axios from 'axios';

const Baseurl = import.meta.env.VITE_BASEURL;

const DentistSelector = ({ onSelectDentist, isSubmited, missingDentist, setMissingDentist }) => {
    const [dentists, setDentists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDentist, setSelectedDentist] = useState('');
    const [isValid, setisvalid] = useState(false);


    useEffect(() => {
        if (isSubmited) {
            setSelectedDentist('');
            if (onSelectDentist) {
                onSelectDentist(null);
            }
        }
    }, [isSubmited]);

    const fetchDentists = async () => {
        try {
            const response = await axios.get(`${Baseurl}/dentist/dentistnames`);
            const dentist_availableOnly = response.data.filter((den) => den.isAvailable === true)
            setDentists(dentist_availableOnly);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dentists:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDentists();
    }, []);

    const handleDentistChange = (e) => {
        const selectedId = e.target.value;
        const dentistData = dentists.find(dentist => dentist._id === selectedId);

        setSelectedDentist(selectedId);

        if (onSelectDentist) {
            onSelectDentist(dentistData);
        }
        setisvalid(false)
        setMissingDentist(false)
    };

    return (
        <div className="p-4">
            {loading ? (
                <div className="flex justify-center items-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className="flex flex-col space-y-2">
                    <label htmlFor="dentist" className="font-medium text-gray-700">Select Dentist
                        <span className="text-red-500 text-xl">*</span>
                    </label>
                    <select
                        id="dentist"
                        value={selectedDentist}
                        onChange={handleDentistChange}
                        className={`p-2 border-2 rounded-md ${missingDentist ? 'border-red-500' : selectedDentist ? 'border-green-500' : 'border-gray-300'}`}
                    >
                        <option value="">-- Choose a Dentist --</option>
                        {dentists.map(dentist => (
                            <option key={dentist._id} value={dentist._id}>
                                {`${dentist.FirstName} ${dentist.LastName}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default DentistSelector;
