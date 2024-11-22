import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const BASEURL = import.meta.env.VITE_BASEURL;

export default function EditStaffModal({ staffId, onClose, onSave }) {
    const [staffData, setStaffData] = useState(null);
    const [contactError, setContactError] = useState('');

    const fetchStaff = async () => {
        Swal.fire({
            title: 'Loading staff data...',
            text: 'Please wait while we fetch the data.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await axios.post(`${BASEURL}/Admin/auth/ClinicStaff-data`, {
                userid: staffId,
            });
            
            const fetchedData = response.data || {};

            // Check if the contactNumber exists and doesn't start with '0', and add '0' if necessary
            if (fetchedData.contactNumber) {
                const contactNumberStr = String(fetchedData.contactNumber); // Convert to string if it's not already
                if (!contactNumberStr.startsWith('0')) {
                    fetchedData.contactNumber = '0' + contactNumberStr; // Prepend '0'
                }
            }

            setStaffData(fetchedData);


            Swal.close();
        } catch (error) {
            console.error('Error fetching staff data:', error);
            Swal.fire('Error', 'There was an error fetching the staff data.', 'error');
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [staffId]);

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

        const staffToUpdate = {
            user_id: staffData._id,
            FirstName: staffData.FirstName,
            LastName: staffData.LastName,
            MiddleName: staffData.MiddleName || '',
            Email: staffData.Email,
            contactNumber: staffData.contactNumber,
        };

        try {
            await axios.put(`${BASEURL}/Admin/auth/Update`, staffToUpdate, {
                withCredentials: true,
            });
            onSave(staffToUpdate);
            Swal.fire('Success', 'Staff data updated successfully.', 'success');
            onClose();
        } catch (error) {
            console.error('Error updating staff:', error);
            Swal.fire('Error', 'There was an error updating the staff data.', 'error');
        }
    };


    if (!staffData) {
        return null;
    }
    const default_pfp = '/default-avatar.jpg'

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full sm:w-[600px] md:w-[900px] max-w-full">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Edit Staff Information</h2>

                <div className="mb-6 flex justify-center">
                    <img
                        src={staffData.ProfilePicture || default_pfp}
                        alt="Profile"
                        className="w-24 h-24 rounded-full border-4 border-gray-200 shadow-md"
                    />
                </div>

                <form onSubmit={handleSaveChanges}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">First Name</label>
                            <input
                                type="text"
                                name="FirstName"
                                value={staffData.FirstName || ''}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Last Name</label>
                            <input
                                type="text"
                                name="LastName"
                                value={staffData.LastName || ''}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Middle Name</label>
                            <input
                                type="text"
                                name="MiddleName"
                                value={staffData.MiddleName || ''}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Email</label>
                            <input
                                type="email"
                                name="Email"
                                value={staffData.Email || ''}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                            <input
                                type="text"
                                name="contactNumber"
                                value={staffData.contactNumber || ''}
                                onChange={handleInputChange}
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
                            />
                            {contactError && <p className="text-red-500 text-sm mt-2">{contactError}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Role</label>
                            <input
                                type="text"
                                value={staffData.Role || ''}
                                readOnly
                                className="mt-2 p-3 border border-gray-300 rounded-lg w-full bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
