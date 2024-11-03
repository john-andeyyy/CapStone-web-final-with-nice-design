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
                setPatients(response.data);
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
        createPDF();

        Swal.fire({
            title: "PDF Generated!",
            text: "Your PDF has been successfully generated.",
            icon: "success"
        });
    };


    const createPDF = () => {
        console.log("Generating PDF..."); // Debugging log
        const doc = new jsPDF();
        const themeColor = "#3EB489"; // Consistent theme color

        // Title section
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0); // Black text for title
        doc.text('Patient Procedures Report', 14, 20); // Title

        if (selectedPatient) {
            doc.setFontSize(16);
            doc.text(`Procedures for ${selectedPatient.FirstName} ${selectedPatient.LastName}`, 14, 30);

            const rows = Object.entries(proceduresCount).map(([procedureName, count]) => (
                [procedureName, count]
            ));

            // Check if rows have data
            console.log("Rows for PDF:", rows); // Debugging log
            if (rows.length === 0) {
                doc.text('No procedures found for this patient.', 14, 40);
            } else {
                // Add the table to the PDF
                autoTable(doc, {
                    head: [['Procedure Name', 'Count']],
                    body: rows,
                    startY: 40,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [22, 160, 133], // Header background color
                        textColor: [255, 255, 255], // Header text color
                        fontStyle: 'bold',
                        fontSize: 12,
                    },
                    bodyStyles: {
                        fontSize: 10,
                    },
                    alternateRowStyles: {
                        fillColor: [240, 240, 240], // Alternate row color
                    },
                    tableLineColor: [0, 0, 0],
                    tableLineWidth: 0.1,
                    margin: { top: 10 },
                });

                // Save the PDF with the patient's name
                doc.save(`${selectedPatient.FirstName}_${selectedPatient.LastName}_Procedures_Report.pdf`);
            }
        } else {
            doc.setFontSize(14);
            doc.text('No patient selected', 14, 40);
            doc.save('Procedures_Report_No_Patient_Selected.pdf'); // Save a report indicating no patient was selected
        }
    };

    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    return (

        <div className="rounded-md"
            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
            <div className="bg-gray-100 rounded-md">

                <div className="grid grid-cols-2 ">
                    <div className="flex flex-col ">
                        <ReportMenu />
                    </div>
                    <div className="flex justify-end items-start p-5">
                        <button
                            onClick={generatePDF}
                            className="bg-[#3EB489] hover:bg-[#62A78E] text-white rounded px-4 py-2"
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
                                    className="ml-2 border rounded px-2 py-1 mb-4"
                                    value={selectedPatient ? selectedPatient.id : ''}
                                    onChange={handlePatientChange}
                                >
                                    <option value="">--Select a patient--</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {`${patient.FirstName} ${patient.LastName}`}
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
