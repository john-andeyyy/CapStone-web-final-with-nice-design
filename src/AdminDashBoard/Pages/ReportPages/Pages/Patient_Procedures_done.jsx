import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReportMenu from '../components/ReportMenu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

const PatientProceduresDone = () => {
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [proceduresCount, setProceduresCount] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASEURL}/Patient/auth/getAllPatients`, {
                    withCredentials: true,
                });


                const sortedPatients = response.data.sort((a, b) => {
                    if (a.LastName < b.LastName) return -1; // If a.LastName is alphabetically before b.LastName
                    if (a.LastName > b.LastName) return 1;  // If a.LastName is alphabetically after b.LastName
                    return 0;  // If they are the same
                });


                setPatients(sortedPatients);

            } catch (error) {
                console.error('Error fetching patients:', error);
                setError('Failed to fetch patients.');
            }
        };

        fetchPatients();
    }, []);

    const getCompletedProceduresCount = async (patientId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASEURL}/Appointments/AdminUser/appointmentofuser/${patientId}`, {
                withCredentials: true,
            });

            const completedProcedures = response.data.filter(appointment => appointment.Status === 'Completed');
            const procedureCounts = {};

            completedProcedures.forEach(appointment => {
                appointment.procedures.forEach(proc => {
                    procedureCounts[proc.Procedure_name] = (procedureCounts[proc.Procedure_name] || 0) + 1;
                });
            });

            return procedureCounts;
        } catch (error) {
            console.error('Error fetching procedures:', error);
            return {};
        }
    };

    const fetchProceduresCounts = async (patientId) => {
        const counts = await getCompletedProceduresCount(patientId);
        setProceduresCount(counts);
    };

    const handlePatientChange = (e) => {
        const patientId = e.target.value;
        const patient = patients.find(p => p.id === patientId);

        if (patient) {
            setSelectedPatient(patient);
            fetchProceduresCounts(patientId);
        } else {
            setSelectedPatient(null);
            setProceduresCount({});
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value) {
            const filtered = patients.filter(patient =>
                `${patient.FirstName} ${patient.LastName}`.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (patient) => {
        setSelectedPatient(patient);
        setSearchTerm(`${patient.FirstName} ${patient.LastName}`);
        setSuggestions([]);
        fetchProceduresCounts(patient.id);
    };

    const generatePDF = () => {
        Swal.fire({
            title: "PDF Generated!",
            text: "Your report has been successfully generated.",
            icon: "success"
        });
        createPDF();
    };


    const createPDF = async () => {
        console.log("Generating PDF...");
        console.log('Selected Patient ID:', selectedPatient.id);  // assuming selectedPatient.id contains the patient ID you want to use

        try {
            // Prepare the data to be sent in the POST request
            const data = {
                PatientId: selectedPatient.id,  // Use the selected patient ID here
            };

            // Send the POST request to the backend to generate the PDF
            const response = await axios.post(
                `${import.meta.env.VITE_BASEURL}/generate-report-Patient_Procedures_done`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',  // Make sure you're sending JSON
                    },
                    responseType: 'blob',  // Handle the response as a PDF (binary data)
                    withCredentials: true  // Include credentials (cookies) with the request
                }
            );

            console.log("PDF generated successfully.");

            // Create a download link for the PDF
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = 'Patient_Procedures_Report.pdf';  // Name of the PDF file to download
            link.click();  // Trigger the download


        } catch (error) {
            console.error("Error generating PDF:", error);

            // Handle any errors that occur during the request
            Swal.fire({
                title: "Error",
                text: "An error occurred while generating the PDF. Please try again.",
                icon: "error"
            });
        }
    };


    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    return (

        <div className="rounded-md"
            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
            <div className="bg-gray-100 rounded-md">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 ">
                    <div className='flex items-center justify-start sm:items-start'>
                        <ReportMenu />
                    </div>
                    <div className="flex justify-center sm:justify-end items-center sm:items-start p-4 sm:p-5">
                        <button
                            onClick={generatePDF}
                            className={`px-4 py-2 text-white rounded transition duration-200 w-full sm:w-auto ${!selectedPatient ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3EB489] hover:bg-[#62A78E]'
                                }`}
                            disabled={!selectedPatient} // Disable if no patient is selected
                        >
                            Generate PDF
                        </button>
                    </div>

                </div>


                <div className="rounded-lg shadow-md p-2">
                    <div className='flex flex-col lg:flex-row justify-between items-center mb-4'>
                        <h1 className="text-2xl font-bold text-[#3EB489] p-2">Patient Procedures Done</h1>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Patients..."
                                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <div className="absolute left-3 top-3 h-4 w-4 text-gray-500">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                        </div>
                    </div>

                    {suggestions.length > 0 && (
                        <ul className="border rounded shadow-lg bg-white max-h-40 overflow-auto z-10 absolute">
                            {suggestions.map(patient => (
                                <li
                                    key={patient.id}
                                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => handleSuggestionClick(patient)}
                                >
                                    {`${patient.FirstName} ${patient.LastName}`}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className='grid grid-cols-2'>
                        <div className="flex flex-col">
                            <label className="block mb-2 mt-2">
                                Select Patient:
                                <select
                                    className="ml-2 border rounded px-2 py-1 mb-4 max-h-40 overflow-y-auto"
                                    value={selectedPatient ? selectedPatient.id : ''}
                                    onChange={handlePatientChange}
                                >
                                    <option value="">--Select a patient--</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {`${patient.LastName} ${patient.FirstName}`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>


                    {selectedPatient && (
                        <div>
                            <h2 className="text-xl font-bold mb-2">{`Procedures for ${selectedPatient.FirstName} ${selectedPatient.LastName}`}</h2>
                            <table className="min-w-full border border-black bg-white">
                                <thead>
                                    <tr className="bg-[#3EB489] text-white">
                                        <th className="border border-black px-4 py-2">Procedure Name</th>
                                        <th className="border border-black px-4 py-2">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(proceduresCount).map(([procedureName, count]) => (
                                        <tr key={procedureName}>
                                            <td className="border px-4 py-2  border-black">{procedureName}</td>
                                            <td className="border px-4 py-2  border-black ">{count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Button to Generate PDF */}

                </div>
            </div>
        </div>

    );
};

export default PatientProceduresDone;
