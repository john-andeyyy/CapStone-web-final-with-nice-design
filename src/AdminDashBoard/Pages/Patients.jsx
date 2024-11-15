import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchPatients } from '../Fetchs/patient/patient_account';
import AddPatientModal from './Components/AddPatientModal';
import { jsPDF } from 'jspdf';
import TreatmentPlanModal from '../Components/PatientTreatment/Component/TreatmentPlanModal';
import Swal from 'sweetalert2';

export default function Patients_List() {
    const navigate = useNavigate();
    const Roletype = localStorage.getItem('Role')
    const [loading, setLoading] = useState(true);
    const [patientsInfo, setPatientsInfo] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selecteduser, setSelectedUser] = useState('');
    const [sortAscending, setSortAscending] = useState(true);
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handlePatientAdded = () => {
        fetch_patient();
    };

    const clinicDataRef = useRef(null);

    const fetchclinicdata = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASEURL}/Contactus/contactus`,
                {
                    withCredentials: true
                }
            );
            const data = response.data[0];
            clinicDataRef.current = data;
        } catch (error) {
            console.error("Error fetching clinic data:", error);
        }
    };

    const createPDF = () => {
        fetchclinicdata();

        const doc = new jsPDF();
        const themeColor = "#3EB489";
        const rowHeight = 10;
        let y = 30; // Starting position for clinic info

        // Header - Clinic Logo and Dental Name
        doc.setFillColor(themeColor);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, "F");

        // Clinic Logo and Dental Name
        const clinic = clinicDataRef.current;
        if (clinic) {
            doc.setFontSize(16);
            doc.setTextColor(255, 255, 255);

            // Add Clinic Logo (if available)
            if (clinic.logo) {
                const logoHeight = 15; // Adjust based on your logo's height
                const logoWidth = 15; // Adjust based on your logo's width
                const logoX = 10; // X position
                const logoY = 3;  // Y position
                doc.addImage(clinic.logo, 'PNG', logoX, logoY, logoWidth, logoHeight); // Add logo image at the top left corner
            }

            // Dental Name
            const textX = clinic.logo ? 30 : 10; // Position text depending on the logo presence
            doc.text(clinic.DentalName, textX, 12); // Display the dental name beside the logo
        }

        // Patient List Title
        y = 40; // Adjusting y position for patient list title
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Patient List", 10, y);

        // Table Header - Patient Data
        y += 10; // Move down for table headers
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

        // Patients Data (filteredPatients should be available in your code)
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
                    : "Processing",
                162,
                y + 7
            );

            y += rowHeight;
        });

        // Footer - Clinic Info (Contact Number, Address, Email, Weekdays and Weekends Time)
        const pageHeight = doc.internal.pageSize.getHeight();
        const footerHeight = 25; // Adjust footer height to accommodate clinic info
        doc.setFillColor(themeColor);
        doc.rect(0, pageHeight - footerHeight, doc.internal.pageSize.getWidth(), footerHeight, "F");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);

        // Contact Info in Footer
        if (clinic) {
            const clinicInfo = [
                `Contact Number: ${clinic.ContactNumber}`,
                `Address: ${clinic.Address}`,
                `Email: ${clinic.Email}`,
                `Operating Hours: ${clinic.WeekdaysTime} / ${clinic.WeekendsTime}` // Combine weekdays and weekends time into one line
            ];

            clinicInfo.forEach((info, index) => {
                const offsetY = 5 + (index * 6);  // Increased spacing for footer text
                doc.text(info, 10, pageHeight - footerHeight + offsetY);
            });
        }

        // Save the PDF
        doc.save("Patients_List.pdf");
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

    // Filter patients based on search query and whether they are active, archived, or have no record
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

    // Separate active, archived, and no-record patients
    const activePatients = filteredPatients.filter(patient => !hasNoRecord(patient.LatestAppointment?.date) && !isArchived(patient.LatestAppointment?.date));
    const archivedPatients = filteredPatients.filter(patient => !hasNoRecord(patient.LatestAppointment?.date) && isArchived(patient.LatestAppointment?.date));
    const noRecordPatients = filteredPatients.filter(patient => hasNoRecord(patient.LatestAppointment?.date));

    const generatePDF = () => {
        createPDF();
        Swal.fire({
            title: "PDF Generated!",
            text: "Your PDF has been successfully generated.",
            icon: "success"
        });
    };

    const [isModaltreatment, setIsModaltreatment] = useState(false);

    const handleOpenModaltreatmen = () => setIsModaltreatment(true);
    const handleCloseModaltreatmen = () => setIsModaltreatment(false);

    const handleFilterChange = (filterName) => {
        setFilters((prevFilters) => {
            const newFilters = {
                ...prevFilters,
                [filterName]: !prevFilters[filterName],
            };

            // Check if all filters are false, and if so, set them all to true
            if (!newFilters.showActive && !newFilters.showArchived && !newFilters.showNoRecord) {
                return {
                    showActive: true,
                    showArchived: true,
                    showNoRecord: true,
                };
            }

            return newFilters;
        });
    };


    const getBackgroundColor = (status) => {
        switch (status) {
            case 'Active Patients (Within 3 months)':
                return 'bg-green-200 bg-opacity-50';
            case 'Archived Patients (Older than 3 months)':
                return 'bg-yellow-200 bg-opacity-50';
            case 'Processing (No last visit)':
                return 'bg-red-200 bg-opacity-50';
            default:
                return 'bg-gray-200'; // Default color
        }
    };
    const getIconColor = (status) => {
        switch (status) {
            case 'Active Patients (Within 3 months)':
                return '#28A745';
            case 'Archived Patients (Older than 3 months)':
                return '#FFC107';
            case 'Processing (No last visit)':
                return '#DC3545';
            default:
                return '#000000'; // Default black icon
        }
    };


    return (
        <div className={`container mx-auto p-4 min-h-screen ${localStorage.getItem('Role') === 'dentist' ? 'pt-10' : 'pt-0'}`}>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <>
                    <div className="flex mt-10 flex-col lg:flex-row justify-between items-center pb-5">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-semibold pb-2">Patients List</h1>
                            <button onClick={fetch_patient} className="p-2">
                                <span className="material-symbols-outlined">refresh</span>
                            </button>
                        </div>

                        {/* Action Buttons */}
                <div className="flex space-x-2 sm:space-x-4">
                    {localStorage.getItem('Role') !== 'dentist' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-2 text-white bg-[#025373] hover:bg-[#03738C] rounded w-full sm:w-auto"
                        >
                            Add Patient
                        </button>
                    )}

                    <button
                        onClick={generatePDF}
                        className="p-2 text-white bg-[#3FA8BF] hover:bg-[#96D2D9] rounded w-full sm:w-auto"
                    >
                        Generate PDF
                    </button>
                </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
    {/* Search Input */}
    <div className="relative flex-grow mt-8 ">
        <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 rounded-md focus:outline-none focus:border-blue-500 w-full sm:w-64"
        />
        <div className="absolute left-3 top-3 h-4 w-4 text-gray-500">
            <span className="material-symbols-outlined">search</span>
        </div>
    </div>

 {/* Filter Section */}
                    {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 py-4 gap-2 ">
                        {[
                            { label: 'Active Patients (Within 3 months)', filterName: 'showActive' },
                            { label: 'Archived Patients (Older than 3 months)', filterName: 'showArchived' },
                            { label: 'Processing (No last visit)', filterName: 'showNoRecord' },
                        ].map(({ label, filterName }) => (
                            <div
                                key={filterName}
                                className={`flex items-center cursor-pointer p-2 rounded-md ${getBackgroundColor(label)} hover:bg-opacity-75 transition duration-200`}
                                onClick={() => handleFilterChange(filterName)}
                            >
                                <span
                                    className="material-symbols-outlined text-2xl"
                                    style={{ color: getIconColor(label) }}
                                >
                                    {filters[filterName] ? 'radio_button_checked' : 'radio_button_unchecked'}
                                </span>
                                <p className="text-gray-700 font-medium ml-2">{label}</p>
                            </div>
                        ))}
                    </div>     */}

                    <div className="flex flex-col space-y-2 py-4">
                        <label htmlFor="patient-filter" className="font-medium text-gray-700">Filter Patients</label>
                        
                        <select
                            id="patient-filter"
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="p-2 border border-gray-300 bg-gray-100 rounded-md"
                        >
                            <option value="">-- Choose Filter --</option>
                            {[
                                { label: 'Active Patients (Within 3 months)', filterName: 'showActive' },
                                { label: 'Archived Patients (Older than 3 months)', filterName: 'showArchived' },
                                { label: 'Processing (No last visit)', filterName: 'showNoRecord' },
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
                                                        title="tooth history"
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
                                                                title="tooth history"
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
