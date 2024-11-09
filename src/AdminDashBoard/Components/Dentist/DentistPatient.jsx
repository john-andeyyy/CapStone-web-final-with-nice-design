import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Baseurl = import.meta.env.VITE_BASEURL;

export default function DentistPatient() {
    const navigate = useNavigate();
    const [appointmentData, setAppointmentData] = useState(null);

    useEffect(() => {
        axios.get(`${Baseurl}/dentist/Dentist_handle_patient/672d72dcc5e5ad6e93e297de`, {
            withCredentials: true,  // Include credentials (cookies, authorization headers)
        })
            .then((response) => {
                const data = response.data;
                if (Array.isArray(data)) {
                    setAppointmentData(data);
                } else {
                    console.error('Data is not an array:', data);
                    setAppointmentData([data]);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    if (!appointmentData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-4">Patient List</h1>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-[#3EB489] text-white">
                            <tr>
                                <th className="px-4 py-2 text-left">Last Name</th>
                                <th className="px-4 py-2 text-left">First Name</th>
                                <th className="px-4 py-2 text-left">Middle Name</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointmentData.map((appointment) => (
                                <tr key={appointment._id} className="border-t hover:bg-gray-100">
                                    <td className="px-4 py-2">{appointment.patient.LastName}</td>
                                    <td className="px-4 py-2">{appointment.patient.FirstName}</td>
                                    <td className="px-4 py-2">{appointment.patient.MiddleName}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex space-x-2 sm:space-x-4 justify-center flex-wrap">
                                            {/* View Patient Profile Button */}
                                            <button
                                                className="flex items-center justify-center w-10 sm:w-12 bg-[#3EB489] text-white hover:bg-[#2e9e70] transition duration-200 rounded-lg shadow-md py-2"
                                                onClick={() => navigate(`/PatientProfile/${appointment.patient._id}`)}
                                                title="View Patient Profile"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>

                                            {/* Tooth History Button */}
                                            <button
                                                onClick={() => navigate(`/Patient2d/${appointment.patient._id}`)}
                                                className="flex items-center justify-center w-10 sm:w-12 bg-[#F1F5F9] text-[#3EB489] hover:bg-[#e0f3e3] transition duration-200 rounded-lg shadow-md py-2"
                                                title="Tooth History"
                                            >
                                                <span className="material-symbols-outlined">dentistry</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
