import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchPatients } from '../Fetchs/patient/patient_account';
import AddPatientModal from './Components/AddPatientModal';
import { jsPDF } from 'jspdf';
import TreatmentPlanModal from '../Components/PatientTreatment/Component/TreatmentPlanModal';

export default function Patients_List() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [patientsInfo, setPatientsInfo] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selecteduser, setSelectedUser] = useState('');
    const [sortAscending, setSortAscending] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handlePatientAdded = () => {
        fetch_patient();
    };

    const handleSort = () => {
        const sortedPatients = [...patientsInfo].sort((a, b) => {
            const lastNameA = a.LastName.toLowerCase();
            const lastNameB = b.LastName.toLowerCase();
            return sortAscending
                ? lastNameA.localeCompare(lastNameB)
                : lastNameB.localeCompare(lastNameA);
        });
        setPatientsInfo(sortedPatients);
        setSortAscending(!sortAscending);
    };

    const filteredPatients = patientsInfo.filter((patient) => {
        const fullName = `${patient.FirstName} ${patient.LastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const generatePDF = () => {
        const doc = new jsPDF();
        const themeColor = "#3EB489";
        const rowHeight = 10;
        let y = 30;

        doc.setFillColor(themeColor);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, "F");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("Patients List", 10, 12);

        doc.setFillColor(themeColor);
        doc.rect(10, y, doc.internal.pageSize.getWidth() - 20, rowHeight, "F");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text("No.", 12, y + 7);
        doc.text("ID", 22, y + 7);
        doc.text("Last Name", 42, y + 7);
        doc.text("First Name", 82, y + 7);
        doc.text("Middle Name", 122, y + 7);
        doc.text("Last Visit", 162, y + 7);

        doc.setTextColor(0, 0, 0);
        y += rowHeight;

        filteredPatients.forEach((patient, index) => {
            const rowNumber = index + 1;

            if (index % 2 === 0) {
                doc.setFillColor(240, 240, 240);
                doc.rect(10, y, doc.internal.pageSize.getWidth() - 20, rowHeight, "F");
            }

            doc.text(rowNumber.toString(), 12, y + 7);
            doc.text(patient.id.toString(), 22, y + 7);
            doc.text(patient.LastName, 42, y + 7);
            doc.text(patient.FirstName, 82, y + 7);
            doc.text(patient.MiddleName ? patient.MiddleName : "N/A", 122, y + 7);
            doc.text(
                patient.LatestAppointment
                    ? new Date(patient.LatestAppointment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })
                    : "No Record",
                162,
                y + 7
            );

            y += rowHeight;
        });

        doc.save("Patients_List.pdf");
    };

    const [isModaltreatment, setIsModaltreatment] = useState(false);

    const handleOpenModaltreatmen = () => setIsModaltreatment(true);
    const handleCloseModaltreatmen = () => setIsModaltreatment(false);

    return (
        <div className='container mx-auto p-4'>
            {loading ? (
                <div className='flex justify-center items-center h-screen'>
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <>
                    <div className='flex flex-col lg:flex-row justify-between items-center'>
                        <div className='flex justify-between items-center'>
                            <h1 className='text-2xl font-semibold pb-2'>Patients List</h1>
                            <button onClick={fetch_patient} className='p-2'>
                                <span className="material-symbols-outlined">refresh</span>
                            </button>
                        </div>

                        <div className='relative'>
                            <input
                                type='text'
                                placeholder='Search patients...'
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className='block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
                            />
                            <div className='absolute left-3 top-3 h-4 w-4 text-gray-500'>
                                <span className="material-symbols-outlined">search</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#4285F4] hover:bg-[#0C65F8] text-white px-4 py-2 rounded"
                        >
                            Add Patient
                        </button>

                        <button
                            onClick={generatePDF}
                            className="bg-[#3EB489] hover:bg-[#62A78E] ml-2 text-white px-4 py-2 rounded"
                        >
                            Generate PDF
                        </button>
                    </div>

                        <div className="mt-4 overflow-auto max-h-[510px]">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left border-collapse">
                                    <thead className="bg-[#3EB489] text-white sticky top-0 z-1">
                                        <tr>
                                            <th className="p-2 text-center border border-black hidden md:table-cell">ID</th>
                                            <th className="p-2 text-center border border-black">
                                                Last Name
                                                {/* <button onClick={handleSort} className="ml-2">
                                                    <span className="material-symbols-outlined">
                                                        {sortAscending ? 'arrow_upward' : 'arrow_downward'}
                                                    </span>
                                                </button> */}
                                            </th>
                                            <th className="p-2 text-center border border-black">First Name</th>
                                            <th className="p-2 text-center border border-black hidden md:table-cell">Middle Name</th>
                                            <th className="p-2 text-center border border-black hidden md:table-cell">Last Visit</th>
                                            <th className="p-2 text-center border border-black">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map((patient) => (
                                                <tr key={patient.id} className="border-b">
                                                    <td className="p-2 bg-gray-100 border border-black hidden md:table-cell">{patient.id}</td>
                                                    <td className="p-2 bg-gray-100 border border-black">{patient.LastName}</td>
                                                    <td className="p-2 bg-gray-100 border border-black">{patient.FirstName}</td>
                                                    <td className="p-2 bg-gray-100 border border-black hidden md:table-cell">{patient.MiddleName || 'N/A'}</td>
                                                    <td className="p-2 bg-gray-100 border border-black hidden md:table-cell">
                                                        {patient.LatestAppointment
                                                            ? new Date(patient.LatestAppointment.date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })
                                                            : <span className="text-red-600">No Record</span>}
                                                    </td>
                                                    <td className="p-2 text-center bg-gray-100 border border-black">
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
                                                                    setSelectedUser(patient.id); // Set the selected user
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
                                                                title="tooth history"
                                                            >
                                                                <span className="material-symbols-outlined">dentistry</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="p-4 text-center">No patients found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
