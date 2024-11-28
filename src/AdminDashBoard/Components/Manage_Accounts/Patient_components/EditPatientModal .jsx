import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
const BASEURL = import.meta.env.VITE_BASEURL;

export default function EditPatientModal({ patientId, onClose, onSave }) {
    const [patientData, setPatientData] = useState(null);
    const [errors, setErrors] = useState({});

    const fetchPatient = async () => {
        Swal.fire({
            title: 'Loading patient data...',
            text: 'Please wait while we fetch the data.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await axios.post(`${BASEURL}/Patient/auth/Patient`, {
                user_id: patientId,
            }, {
                withCredentials: true
            });
            const fetchedPatient = response.data;
            setPatientData(fetchedPatient);
            Swal.close();
        } catch (error) {
            console.error('Error fetching patient data:', error);
            Swal.fire('Error', 'There was an error fetching the patient data.', 'error');
        }
    };

    useEffect(() => {
        fetchPatient();
    }, [patientId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePhoneNumberChange = (e) => {
        const { value } = e.target;
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 11) {
            setPatientData((prevState) => ({
                ...prevState,
                PhoneNumber: numericValue,
            }));
        }
    };

    function computeAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    const validateForm = () => {
        const newErrors = {};

        if (!patientData.FirstName) {
            newErrors.FirstName = 'First name is required';
        }
        if (!patientData.LastName) {
            newErrors.LastName = 'Last name is required';
        }
        if (!patientData.Email || !/\S+@\S+\.\S+/.test(patientData.Email)) {
            newErrors.Email = 'A valid email is required';
        }
        if (!patientData.PhoneNumber || patientData.PhoneNumber.length < 10 || patientData.PhoneNumber.length > 11) {
            newErrors.PhoneNumber = 'Phone number must be between 10 and 11 digits';
        }
        if (!patientData.Age || patientData.Age <= 0) {
            newErrors.Age = 'Age must be a positive number';
        }
        if (!patientData.Zipcode) {
            newErrors.Zipcode = 'Zipcode  is required';
        }
        if (!patientData.Gender) {
            newErrors.Gender = 'Gender is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const patientToUpdate = {
            user_id: patientData.id,
            FirstName: patientData.FirstName,
            LastName: patientData.LastName,
            MiddleName: patientData.MiddleName || '',
            Email: patientData.Email,
            Username: patientData.Username,
            PhoneNumber: patientData.PhoneNumber,
            Age: patientData.Age,
            Address: patientData.Address,
            Zipcode: patientData.Zipcode,
            Gender: patientData.Gender,
        };

        axios.put(`${BASEURL}/Patient/auth/Update`, patientToUpdate, { withCredentials: true })
            .then((response) => {
                onSave(patientData);
                Swal.fire('Success', 'Patient data updated successfully', 'success');
            })
            .catch((error) => {
                console.error('Error updating patient:', error);
                Swal.fire('Error', 'There was an error updating the patient data.', 'error');
            });
    };

    if (!patientData) {
        return <div>Loading...</div>;
    }

    const defaultpfp = '/default-avatar.jpg';
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full sm:w-[600px] md:w-[900px] max-w-full">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Edit Patient Information</h2>
                <div className="mb-6 flex justify-center">
                    <img
                        src={patientData.ProfilePicture || defaultpfp}
                        alt="Profile"
                        className="w-24 h-24 rounded-full border-4 border-gray-200 shadow-md"
                    />
                </div>
                <form onSubmit={handleSaveChanges}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">First Name <span className='text-red-600'>*</span></label>
                            <input
                                type="text"
                                name="FirstName"
                                value={patientData.FirstName}
                                onChange={handleInputChange}
                                className="capitalize mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.FirstName && <p className="text-red-500 text-xs">{errors.FirstName}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Last Name <span className='text-red-600'>*</span></label>
                            <input
                                type="text"
                                name="LastName"
                                value={patientData.LastName}
                                onChange={handleInputChange}
                                className="capitalize mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.LastName && <p className="text-red-500 text-xs">{errors.LastName}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Middle Name</label>
                            <input
                                type="text"
                                name="MiddleName"
                                value={patientData.MiddleName || ''}
                                onChange={handleInputChange}
                                className="capitalize mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Email <span className='text-red-600'>*</span></label>
                            <input
                                type="email"
                                name="Email"
                                value={patientData.Email}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.Email && <p className="text-red-500 text-xs">{errors.Email}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Username <span className='text-red-600'>*</span></label>
                            <input
                                type="text"
                                name="Username"
                                value={patientData.Username}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.Username && <p className="text-red-500 text-xs">{errors.Username}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Phone Number <span className='text-red-600'>*</span></label>
                            <input
                                type="tel"
                                name="PhoneNumber"
                                value={patientData.PhoneNumber}
                                onChange={handlePhoneNumberChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.PhoneNumber && <p className="text-red-500 text-xs">{errors.PhoneNumber}</p>}
                        </div>
                        <div className="mb-4">

                            <div className='flex items-center'>
                                <label className="block text-sm font-medium text-gray-600">Birthday<span className='text-red-600 '>*</span></label>
                                <h1>{computeAge(patientData.Age)} Years old</h1>
                            </div>
                            <input
                                type="date"
                                id="dob"
                                name="Age"
                                value={patientData.Age}
                                onChange={handleInputChange}
                                max={new Date().toISOString().split("T")[0]} // Restrict to past dates
                                className="mt-1 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Enter your date of birth"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Address</label>
                            <input
                                type="text"
                                name="Address"
                                value={patientData.Address}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Zipcode <span className='text-red-600'>*</span></label>
                            <input
                                type="text"
                                name="Zipcode"
                                value={patientData.Zipcode}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.Zipcode && <p className="text-red-500 text-xs">{errors.Zipcode}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Gender <span className='text-red-600'>*</span></label>
                            <select
                                name="Gender"
                                value={patientData.Gender}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.Gender && <p className="text-red-500 text-xs">{errors.Gender}</p>}
                        </div>
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
