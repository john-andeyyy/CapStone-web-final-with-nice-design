import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EditPatientModal from './Patient_components/EditPatientModal ';
import AddPatientModal from '../../Pages/Components/AddPatientModal';

const BASEURL = import.meta.env.VITE_BASEURL;

export default function ManagePatient() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenADD_PATIENT, setIsModalOpenADD_PATIENT] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');  // State for search query
    const navigate = useNavigate();

    const fetch_patient = async () => {
        axios.get(`${BASEURL}/Patient/auth/getAllPatients`, { withCredentials: true })
            .then((response) => {
                
                setPatients(response.data);
                setFilteredPatients(response.data);
                console.log('response.data', response.data)  
                setLoading(false);
            })
            .catch((error) => {
                setError('Error fetching patients data');
                setLoading(false);
                console.error('Error fetching patients:', error);
            });
    };

    useEffect(() => {
        fetch_patient();
    }, []);

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredPatients(patients); 
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            setFilteredPatients(
                patients.filter(patient =>
                    patient.FirstName.toLowerCase().includes(lowercasedQuery) ||
                    patient.LastName.toLowerCase().includes(lowercasedQuery) ||
                    (patient.MiddleName && patient.MiddleName.toLowerCase().includes(lowercasedQuery))
                )
            );
        }
    }, [searchQuery, patients]);

    const handlePatientAdded = () => {
        fetch_patient();
    };

    const openModal = (patientId) => {
        console.log('patientId', patientId);
        setSelectedPatientId(patientId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPatientId(null);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    if (loading) {
        return <div className="text-center py-4 text-xl">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-xl text-red-600">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className='flex justify-between pb-10'>
                <h1 className="text-2xl font-semibold text-gray-800 mb-4">Manage Patients</h1>
                <button
                    onClick={() => setIsModalOpenADD_PATIENT(true)}
                    className="p-2 text-white bg-[#025373] hover:bg-[#03738C] rounded w-full sm:w-auto"
                >
                    Add Patient
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative flex-grow">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by First, Last, or Middle Name"
                    className="block pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-md focus:outline-none focus:border-blue-500 w-full sm:w-96"  
                />
                <div className="absolute left-3 top-3 h-4 w-4 text-gray-500">
                    <span className="material-symbols-outlined">search</span>
                </div>
            </div>

            <div className="overflow-x-auto max-h-[34rem] bg-gray-50 rounded-lg shadow-md">
                <table className="table-auto w-full border-collapse text-sm">
                    <thead className="bg-[#012840] text-white sticky top-0 z-1">
                        <tr>
                            <th className="p-4 text-center border-b">Patient ID</th>
                            <th className="p-4 text-center border-b">Last Name</th>
                            <th className="p-4 text-center border-b md:table-cell">First Name</th>
                            <th className="p-4 text-center border-b hidden md:table-cell">Middle Name</th>
                            <th className="p-4 text-center border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient, index) => (
                                <tr
                                    key={patient.id}
                                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition`}
                                >
                                    <td className="p-4 text-center">{patient.id}</td>
                                    <td className="p-4 text-center">{patient.LastName}</td>
                                    <td className="p-4 text-center">{patient.FirstName}</td>
                                    <td className="p-4 text-center hidden md:table-cell">{patient.MiddleName || 'N/A'}</td>
                                    <td className="p-4 text-center flex justify-center">
                                        <button
                                            className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-full shadow-sm"
                                            onClick={() => openModal(patient.id)}
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-600">No patients found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedPatientId && (
                <EditPatientModal
                    patientId={selectedPatientId}
                    onClose={closeModal}
                    onSave={(updatedPatient) => {
                        setPatients((prevPatients) =>
                            prevPatients.map((patient) =>
                                patient.id === updatedPatient.id ? updatedPatient : patient
                            )
                        );
                        closeModal();
                    }}
                />
            )}
            <AddPatientModal
                isOpen={isModalOpenADD_PATIENT}
                onClose={() => setIsModalOpenADD_PATIENT(false)}
                onPatientAdded={handlePatientAdded}
            />
        </div>
    );
}
