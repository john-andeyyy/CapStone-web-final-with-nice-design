import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const BASEURL = import.meta.env.VITE_BASEURL;

export default function CreateStaffModal({ onClose, onCreate }) {
    const [staffData, setStaffData] = useState({
        FirstName: '',
        LastName: '',
        MiddleName: '',
        Email: '',
        contactNumber: '',
    });
    const [contactError, setContactError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contactNumber' && !/^\d*$/.test(value)) {
            return;
        }

        if (name === 'contactNumber' && value.length > 11) {
            return;
        }

        setStaffData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'contactNumber') {
            if (value.length > 11) {
                setContactError('Contact number must be exactly 11 digits.');
            } else if (value.length === 0) {
                setContactError('');
            } else {
                setContactError('');
            }
        }
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();

        if (contactError || staffData.contactNumber?.length !== 11) {
            setContactError('Contact number must be exactly 11 digits.');
            return;
        }

        const staffToCreate = {
            FirstName: staffData.FirstName,
            LastName: staffData.LastName,
            MiddleName: staffData.MiddleName || '',
            Email: staffData.Email,
            Username: staffData.FirstName.toUpperCase(),
            Password: staffData.LastName.toUpperCase(),
            contactNumber: staffData.contactNumber,
        };

        try {
            await axios.post(`${BASEURL}/Admin/auth/sign-in`, staffToCreate, {
                withCredentials: true,
            });
            onCreate(staffToCreate);
            Swal.fire('Success', 'Staff created successfully.', 'success');
            onClose();
        } catch (error) {
            console.error('Error creating staff:', error);
            Swal.fire('Error', 'There was an error creating the staff.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full sm:w-[600px] md:w-[800px] max-w-full">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create New Staff</h2>

                <form onSubmit={handleSaveChanges}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">First Name
                                <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type="text"
                                name="FirstName"
                                value={staffData.FirstName}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Last Name
                                <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type="text"
                                name="LastName"
                                value={staffData.LastName}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Middle Name
                                <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type="text"
                                name="MiddleName"
                                value={staffData.MiddleName}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Email
                                <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type="email"
                                name="Email"
                                value={staffData.Email}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Contact Number
                                <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type="text"
                                name="contactNumber"
                                value={staffData.contactNumber}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                            />
                            {contactError && <p className="text-red-500 text-sm mt-2">{contactError}</p>}
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="text-sm text-gray-600 mb-4">
                        <p className="italic">
                            Note: The username is the First Name of the user in all uppercase letters.
                        </p>
                        <p className="italic">
                            The password is the Last Name in all uppercase letters.
                        </p>
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
                            Create Staff
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
