import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Tooth2d from '../Components/Tooth2d';
import Add_RecordbyAdmin from './Components/Add_RecordbyAdmin';

const PatientProfile = () => {
    const defaultimage = '../../../public/default-avatar.jpg'
    const { id } = useParams();
    const navigate = useNavigate()
    const userIds = id;
    const [patient, setPatient] = useState({
        FirstName: "",
        LastName: "",
        MiddleName: "",
    });
    const [dentalHistory, setDentalHistory] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [loading, setloading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [fullPatient, setFullPatient] = useState(null); 
    const Baseurl = import.meta.env.VITE_BASEURL
    const requiredFields = [
        'First Name',
        'Last Name',
        'Middle Name',
        'Email',
        'Username',
        'Address',
        'PhoneNumber',
        'Zipcode',
        'age',
        'Civil Status',
        'Gender'
    ];

    const get_patient = async () => {
        try {
            const response = await axios.get(
                `${Baseurl}/Patient/auth/view_patient_data`,
                {
                    params: { id },
                    withCredentials: true
                }
            );

            setFullPatient(response.data);
            setPatient({
                FirstName: response.data.FirstName || "...",
                LastName: response.data.LastName || "...",
                MiddleName: response.data.MiddleName || "...",
                ProfilePicture: response.data.ProfilePicture 
            });

            const history = await axios.get(
                `${Baseurl}/Appointments/AdminUser/appointmentofuser/${id}`,
                {
                    withCredentials: true
                }
            );

            let historydata = history.data;

            // Sort the history by date (most recent first)
            historydata = historydata.sort((a, b) => new Date(b.date) - new Date(a.date));

            const anyPendingOrEmpty = historydata.some(appointment =>
                appointment.Status.toLowerCase() === 'pending' || appointment.Status === ''
            );

            setShowButton(anyPendingOrEmpty);
            setDentalHistory(historydata);
            console.log('Formatted Procedure History', historydata);

        } catch (error) {
            console.log(error.message);
        }
    };


    useEffect(() => {
        get_patient();
    }, []);

    const formatProcedures = (procedures) => {
        if (procedures.length > 3) {
            const displayedProcedures = procedures.slice(0, 2).map(proc => proc.Procedure_name);
            return `${displayedProcedures.join(', ')}... (${procedures.length - 2} more)`;
        }
        return procedures.map(proc => proc.Procedure_name).join(', ');
    };


    const handleRowClick = (id) => {
        navigate(`/appointment/${id}`);
    };

    const getProfileImage = (profilePicture) => {
        return profilePicture ? profilePicture.toString('base64') : defaultimage;
    };
    const profilePictureDataUrl = getProfileImage(patient.ProfilePicture);


    return (
        <div className="container mx-auto p-4 pt-0">

            <div className='grid grid-cols-2 items-center'>
                <div className='flex items-center'>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-[#025373] hover:text-[#03738C] font-semibold focus:outline-none"
                    >
                        <span className="material-symbols-outlined text-2xl mr-2">arrow_back</span>
                        <p className='text-xl'>Go Back</p>
                    </button>
                </div>
            </div>
            <h1 className="mt-5 mb-5 text-2xl font-bold py-4 lg:py-0">Patient Profile</h1>
            <div className="shadow-md rounded-lg p-6 bg-[#96D2D9]">
                <div className="flex justify-end">
                    <button onClick={() => setIsModalOpen(true)} className="btn text-white bg-[#025373] hover:bg-[#03738C]">
                        Full Details
                    </button>
                </div>
                <div className="flex flex-col lg:flex-row justify-between items-center mb-4 ">
                    <img src={profilePictureDataUrl}
                        alt="Profile"
                        className="mt-4 w-40 h-40 mx-auto"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="field">
                        <label className="block text-sm font-bold uppercase text-black">First Name</label>
                        <input
                            type="text"
                            value={patient.FirstName || ""}
                            readOnly
                            className="bg-gray-100 p-2 mt-1 block w-full rounded-md border-gray-300 shadow-md"
                        />
                    </div>
                    <div className="field">
                        <label className="block text-sm font-bold uppercase text-black">Last Name</label>
                        <input
                            type="text"
                            value={patient.LastName || ""}
                            readOnly
                            className="bg-gray-100 p-2 mt-1 block w-full rounded-md border-gray-300 shadow-md"
                        />
                    </div>
                    <div className="field">
                        <label className="block text-sm font-bold uppercase text-black">Middle Name</label>
                        <input
                            type="text"
                            value={patient.MiddleName || ""}
                            readOnly
                            className="bg-black-100 p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* <Tooth2d userIds={userIds} /> */}
            <button
                onClick={() => {
                    navigate(`/Patient2d/${userIds}`);
                }}
                className='pl-4 pr-4 pt-2 pb-2 bg-[#025373] hover:bg-[#03738C] rounded mt-4 font-semibold text-white'
            >Dental Records
            </button>

            <div className="w-auto mt-5">
                <div className='flex justify-between items-center py-5'>
                    <h3 className="text-xl font-semibold">Procedure History</h3>
                    <Add_RecordbyAdmin userIds={userIds} />
                </div>

                <div className="overflow-x-auto mt-2">
                    <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#012840] text-white sticky top-0  border border-black text-center">
                                <tr>
                                    <th
                                        scope="col"
                                        className="hidden md:table-cell text-center px-2 py-3 border border-black font-medium uppercase tracking-wider"
                                    >
                                        Date
                                    </th>
                                    <th
                                        scope="col"
                                        className="hidden md:table-cell text-center px-2 py-3 border border-black font-medium uppercase tracking-wider"
                                    >
                                        Procedures
                                    </th>
                                    <th
                                        scope="col"
                                        className="hidden md:table-cell text-center px-2 py-3 border border-black font-medium uppercase tracking-wider"
                                    >
                                        Amount
                                    </th>
                                    <th
                                        scope="col"
                                        className="hidden md:table-cell text-center px-2 py-3 border border-black font-medium uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </td>
                                    </tr>
                                ) : dentalHistory.length > 0 ? (
                                    dentalHistory.map((record) => (
                                        <tr
                                            key={record._id}
                                            onClick={() => handleRowClick(record._id)}
                                            className="border border-black cursor-pointer bg-white hover:bg-gray-100"
                                        >
                                            <td className="px-2 py-4 whitespace-nowrap border border-black">
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="hidden md:table-cell px-2 py-4 border border-black whitespace-nowrap">
                                                {formatProcedures(record.procedures)}
                                            </td>
                                            <td className="hidden md:table-cell px-2 py-4 border border-black whitespace-nowrap">
                                                <span>PHP </span>
                                                {new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(record.Amount)}
                                            </td>
                                            <td className="hidden md:table-cell px-2 py-4 border border-black whitespace-nowrap">
                                                {record.Status}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            No records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>

            {/* modal */}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className=" bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2">
                        <div className='flex justify-end'>
                            <button onClick={() => setIsModalOpen(false)} className="text-gary-500">
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </div>
                        <h2 className="text-xl font-semibold mb-4 text-[#00000] text-center ">Full Patient Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fullPatient && requiredFields.map((field) => (
                                <div key={field} className="field">
                                    <label className="block text-sm font-medium capitalize">{field}</label>
                                    <input
                                        type="text"
                                        value={fullPatient[field] || ""}
                                        readOnly
                                        className="bg-gray-100 p-2 mt-1 block w-full rounded-md border-gray-300 shadow-md"
                                    />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientProfile;
