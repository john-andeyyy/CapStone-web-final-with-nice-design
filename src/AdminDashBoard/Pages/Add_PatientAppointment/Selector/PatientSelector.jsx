import { useState, useEffect } from 'react';
import axios from 'axios';

const Baseurl = import.meta.env.VITE_BASEURL;

const PatientSelector = ({ onSelectPatient, isSubmited, missingPatient, setMissingPatient }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [isValid, setisvalid] = useState(false);

    useEffect(() => {
        if (isSubmited) {
            setSelectedPatient('');
            onSelectPatient(null);
        }
    }, [isSubmited, selectedPatient]);

    const fetchPatients = async () => {
        try {
            const response = await axios.get(`${Baseurl}/Patient/patientnameOnly`, { withCredentials: true });
            const sortedPatients = response.data.sort((a, b) => {
                if (a.LastName.toLowerCase() < b.LastName.toLowerCase()) return -1;
                if (a.LastName.toLowerCase() > b.LastName.toLowerCase()) return 1;
                return 0;
            });
            setPatients(sortedPatients);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching patients', error);
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPatients();
    }, []);

    const handlePatientChange = (e) => {
        const selectedId = e.target.value;
        const patientData = patients.find(patient => patient._id === selectedId);

        setSelectedPatient(selectedId);
        onSelectPatient(patientData);
        setMissingPatient(false)
        setisvalid(true)
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPatients = patients.filter(patient =>
        `${patient.FirstName} ${patient.LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4">
            {loading ? (
                <div className="flex justify-center items-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className="flex flex-col space-y-2">
                    <label htmlFor="patient-search" className="font-medium text-gray-700">Search Patient</label>
                    <input
                        type="text"
                        id="patient-search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by name"
                        className="p-2 border border-gray-300 rounded-md"
                    />
                    <label htmlFor="patient" className="font-medium text-gray-700">Select Patient
                        <span className="text-red-500 text-xl">*</span>
                    </label>



                    <select
                        id="patient"
                        value={selectedPatient}
                        onChange={handlePatientChange}
                        className={`p-2 border-2 ${missingPatient ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
                            } rounded-md`}
                        aria-label="Choose a Patient"
                    >
                        <option value="" disabled>-- Choose a Patient --</option> {/* Disabled default option */}
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <option key={patient._id} value={patient._id}>
                                    {`
                                    ${patient.LastName}
                                    ${patient.FirstName} 
                                    `}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>No patients found</option> // No patients message
                        )}
                    </select>

                </div>
            )}
        </div>
    );
};

export default PatientSelector;
