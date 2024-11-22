import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchPatients } from '../Fetchs/patient/patient_account';
import AddPatientModal from './Components/AddPatientModal';
import { jsPDF } from 'jspdf';
import TreatmentPlanModal from '../Components/PatientTreatment/Component/TreatmentPlanModal';
import Swal from 'sweetalert2';

export default function Patients_List() {
    const navigate = useNavigate();
    const location = useLocation()
    const Roletype = localStorage.getItem('Role')
    const [loading, setLoading] = useState(true);
    const [patientsInfo, setPatientsInfo] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selecteduser, setSelectedUser] = useState('');
    const [filter, setfilter] = useState('active')
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        showActive: true,
        showArchived: false,
        showNoRecord: false,
    });

    const fetch_patient = async () => {
        setLoading(true);
        const response = await fetchPatients();
        const sortedPatients = response.sort((a, b) =>
            a.LastName.toLowerCase().localeCompare(b.LastName.toLowerCase())
        );
        setPatientsInfo(sortedPatients);
        setLoading(false);
    };

    useEffect(() => {
        fetch_patient();

    }, []);
    useEffect(() => {
        if (location.pathname === '/patients-manage') {
            console.log('Current URL:', location.pathname);
        }
    }, [location]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handlePatientAdded = () => {
        fetch_patient();
    };
    const createPDF = async () => {
        console.log('filter', filter)
        Swal.fire({
            title: "Generating PDF...",
            text: "Please wait while your PDF is being generated.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        try {
            const filterOption = { filter: filter };

            const response = await axios.post(
                `${import.meta.env.VITE_BASEURL}/generate-report-GeneratePatientList`,
                filterOption,
                {
                    responseType: "blob",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            Swal.fire({
                title: "PDF Generated!",
                text: "Your PDF has been successfully generated.",
                icon: "success"
            });
            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "PatientList.pdf");
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    // Helper function to determine if the patient's last visit is older than 3 months
    const isArchived = (latestAppointmentDate) => {
        const now = new Date();
        const appointmentDate = new Date(latestAppointmentDate);
        const diffTime = now - appointmentDate;
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30); // Convert milliseconds to months
        return diffMonths > 3;
    };

    const hasNoRecord = (latestAppointmentDate) => {
        return !latestAppointmentDate;
    };

    const filteredPatients = patientsInfo.filter((patient) => {
        const fullName = `${patient.FirstName} ${patient.LastName} ${patient.MiddleName} ${patient.id}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase());

        const isActive = !hasNoRecord(patient.LatestAppointment?.date) && !isArchived(patient.LatestAppointment?.date);
        const isArchivedStatus = !hasNoRecord(patient.LatestAppointment?.date) && isArchived(patient.LatestAppointment?.date);
        const isNoRecord = hasNoRecord(patient.LatestAppointment?.date);

        return (
            matchesSearch &&
            (
                (filters.showActive && isActive) ||
                (filters.showArchived && isArchivedStatus) ||
                (filters.showNoRecord && isNoRecord)
            )
        );
    });

    const activePatients = filteredPatients.filter(patient => !hasNoRecord(patient.LatestAppointment?.date) && !isArchived(patient.LatestAppointment?.date));
    const archivedPatients = filteredPatients.filter(patient => !hasNoRecord(patient.LatestAppointment?.date) && isArchived(patient.LatestAppointment?.date));
    const noRecordPatients = filteredPatients.filter(patient => hasNoRecord(patient.LatestAppointment?.date));

    const generatePDF = () => {
        createPDF();
    };
    const [isModaltreatment, setIsModaltreatment] = useState(false);

    const handleOpenModaltreatmen = () => setIsModaltreatment(true);
    const handleCloseModaltreatmen = () => setIsModaltreatment(false);

    const handleFilterChange = (filterName) => {
        if (filterName.toLowerCase() === "all") {
            setFilters({
                showActive: true,
                showArchived: true,
                showNoRecord: true,
            });
            setfilter('all');
        } else {
            setFilters((prevFilters) => ({
                showActive: filterName === "showActive",
                showArchived: filterName === "showArchived",
                showNoRecord: filterName === "showNoRecord",
            }));

            if (filterName == 'showActive') {
                setfilter('active');
            } else if (filterName == 'showArchived') {
                setfilter('archived');
            } else if (filterName == 'showNoRecord') {
                setfilter('processing');
            } 

        }
    };


    return (
        <div className={`container mx-auto p-4 min-h-screen ${localStorage.getItem('Role') !== 'dentist' ? 'pt-0' : 'pt-10'}`}>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <>
                    <div className="flex mt-10 flex-col lg:flex-row justify-between items-center ">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-semibold ">Patients List</h1>
                            <button onClick={fetch_patient} className="p-2">
                                <span className="material-symbols-outlined">refresh</span>
                            </button>
                        </div>

                        {/* Action Buttons */}
                        {localStorage.getItem('Role') == 'admin' && (
                            <div className="flex space-x-2 sm:space-x-4">

                                <div className='hidden'>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="p-2 text-white bg-[#025373] hover:bg-[#03738C] rounded w-full sm:w-auto"
                                    >
                                        Add Patient
                                    </button>
                                </div >

                                <button
                                    onClick={generatePDF}
                                    className="p-2 text-white bg-[#3FA8BF] hover:bg-[#96D2D9] rounded w-full sm:w-auto"
                                >
                                    Generate PDF
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Search Input */}
                        <div className="relative flex-grow mt-8">
                            <input
                                type="text"
                                placeholder="Search by First, Last, or Middle Name"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="block pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-md focus:outline-none focus:border-blue-500 w-full sm:w-96"
                            />
                            <div className="absolute left-3 top-3 h-4 w-4 text-gray-500">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2 py-4">
                            <label htmlFor="patient-filter" className="font-medium text-gray-700">Filter Patients</label>

                            <select
                                id="patient-filter"
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="p-2 border border-gray-300 bg-gray-100 rounded-md"
                            >
                                {/* <option value="all">All Patient</option> */}
                                {[
                                    { label: 'Active Patients (Within 3 months)', filterName: 'showActive' },
                                    { label: 'Archived Patients (Older than 3 months)', filterName: 'showArchived' },
                                    { label: 'Processing (No last visit)', filterName: 'showNoRecord' },
                                    { label: 'All Patients', filterName: 'all' },
                                ].map(({ label, filterName }) => (
                                    <option key={filterName} value={filterName}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Patients Table */}
                    <div className="overflow-x-auto max-h-[34rem]">
                        <table className="table-auto w-full border-collapse">
                            <thead className="bg-[#012840] text-white sticky top-0 z-1">
                                <tr>
                                    <th className="p-2 text-center border border-black">No.</th>
                                    <th className="p-2 text-center border border-black">Last Name</th>
                                    <th className="p-2 text-center border border-black  md:table-cell">First Name</th>
                                    <th className="p-2 text-center border border-black hidden md:table-cell">Middle Name</th>
                                    <th className="p-2 text-center border border-black hidden md:table-cell">Last Visit</th>
                                    <th className="p-2 text-center border border-black">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filters.showActive &&
                                    activePatients.length > 0 &&
                                    activePatients.map((patient) => (
                                        <tr key={patient.id} className="border-b">
                                            <td className="p-2 bg-white border border-black">{patient.id}</td>
                                            <td className="p-2 bg-white border border-black">{patient.LastName}</td>
                                            <td className="p-2 bg-white border border-black">{patient.FirstName}</td>
                                            <td className="p-2 bg-white border border-black hidden md:table-cell">
                                                {patient.MiddleName || 'N/A'}
                                            </td>
                                            <td className="p-2 bg-white border border-black hidden md:table-cell">
                                                {patient.LatestAppointment
                                                    ? new Date(patient.LatestAppointment.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })
                                                    : <span className="text-red-600">Processing</span>}
                                            </td>
                                            <td className="p-2 text-center bg-white border border-black">
                                                <div className="flex space-x-2 justify-center">
                                                    <button
                                                        className="flex items-center justify-center w-10 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-lg shadow-sm"
                                                        onClick={() => navigate(`/PatientProfile/${patient.id}`)}
                                                        title="View"
                                                    >
                                                        <span className="material-symbols-outlined">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(patient.id);
                                                            setIsModaltreatment(true); // Open the treatment modal
                                                        }}
                                                        className="flex items-center justify-center w-10 bg-gray-200 text-gray-600 hover:text-black transition rounded-lg shadow-sm"
                                                        title="Treatment Recommendations"
                                                    >
                                                        <span className="material-symbols-outlined">clinical_notes</span>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/Patient2d/${patient.id}`)}

                                                        className="flex items-center justify-center w-10 bg-white text-gray-600 hover:text-black transition rounded-lg shadow-sm"
                                                        title="Tooth History"
                                                    >
                                                        <span className="material-symbols-outlined">dentistry</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {filters.showArchived &&
                                    archivedPatients.length > 0 &&
                                    archivedPatients.map((patient) => (
                                        <tr key={patient.id} className="border-b">
                                            <td className="p-2 bg-white border border-black">{patient.id}</td>
                                            <td className="p-2 bg-white border border-black">{patient.LastName}</td>
                                            <td className="p-2 bg-white border border-black">{patient.FirstName}</td>
                                            <td className="p-2 bg-white border border-black hidden md:table-cell">
                                                {patient.MiddleName || 'N/A'}
                                            </td>
                                            <td className="p-2 bg-white border border-black hidden md:table-cell">
                                                {patient.LatestAppointment
                                                    ? new Date(patient.LatestAppointment.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })
                                                    : <span className="text-red-600">Processing</span>}
                                            </td>
                                            <td className="p-2 text-center bg-white border border-black">
                                                <div className="flex space-x-2 justify-center">
                                                    <td className="p-2 text-center bg-white border border-black">
                                                        <div className="flex space-x-2 justify-center">
                                                            <button
                                                                className="flex items-center justify-center w-10 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-lg shadow-sm"
                                                                onClick={() => navigate(`/PatientProfile/${patient.id}`)}
                                                                title="View"
                                                            >
                                                                <span className="material-symbols-outlined">visibility</span>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(patient.id);
                                                                    setIsModaltreatment(true); // Open the treatment modal
                                                                }}
                                                                className="flex items-center justify-center w-10 bg-gray-200 text-gray-600 hover:text-black transition rounded-lg shadow-sm"
                                                                title="Treatment Recommendations"
                                                            >
                                                                <span className="material-symbols-outlined">clinical_notes</span>
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/Patient2d/${patient.id}`)}

                                                                className="flex items-center justify-center w-10 bg-white text-gray-600 hover:text-black transition rounded-lg shadow-sm"
                                                                title="Tooth History"
                                                            >
                                                                <span className="material-symbols-outlined">dentistry</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {filters.showNoRecord &&
                                    noRecordPatients.length > 0 &&
                                    noRecordPatients.map((patient) => (
                                        <tr key={patient.id} className="border-b">
                                            <td className="p-2 bg-white border border-black">{patient.id}</td>
                                            <td className="p-2 bg-white border border-black">{patient.LastName}</td>
                                            <td className="p-2 bg-white border border-black">{patient.FirstName}</td>
                                            <td className="p-2 bg-white border border-black hidden md:table-cell">
                                                {patient.MiddleName || 'N/A'}
                                            </td>
                                            <td className="p-2 bg-white border border-black hidden md:table-cell">
                                                <span className="text-red-600">Processing</span>
                                            </td>
                                            <td className="p-2 text-center bg-white border border-black">
                                                <div className="flex space-x-2 justify-center">
                                                    <button
                                                        className="flex items-center justify-center w-10 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-lg shadow-sm"
                                                        onClick={() => navigate(`/PatientProfile/${patient.id}`)}
                                                        title="View"
                                                    >
                                                        <span className="material-symbols-outlined">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(patient.id);
                                                            setIsModaltreatment(true);
                                                        }}
                                                        className="flex items-center justify-center w-10 bg-gray-200 text-gray-600 hover:text-black transition rounded-lg shadow-sm"
                                                        title="Treatment Recommendations"
                                                    >
                                                        <span className="material-symbols-outlined">clinical_notes</span>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/Patient2d/${patient.id}`)}

                                                        className="flex items-center justify-center w-10 bg-white text-gray-600 hover:text-black transition rounded-lg shadow-sm"
                                                        title="Tooth History"
                                                    >
                                                        <span className="material-symbols-outlined">dentistry</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {activePatients.length === 0 && archivedPatients.length === 0 && noRecordPatients.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center">No patients found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <AddPatientModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onPatientAdded={handlePatientAdded}
                    />
                    <TreatmentPlanModal
                        patientId={selecteduser}
                        isOpen={isModaltreatment}
                        onClose={handleCloseModaltreatmen}
                    />
                </>
            )}
        </div>
    );
}
