import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { showToast } from '../../../AdminDashBoard/Components/ToastNotification';
export default function DentistEdit({ isOpen, onClose, selectedDentist, updateDentistData }) {
    const BASEURL = import.meta.env.VITE_BASEURL;

    const [dentistData, setDentistData] = useState({
        FirstName: '',
        LastName: '',
        MiddleName: '',
        ContactNumber: '',
        Address: '',
        Gender: '',
        LicenseNo: '',
        ProfilePicture: null,
    });

    const fileInputRef = useRef(null);
    // Function to get the profile image
    const getProfileImage = (profilePicture) => {
        if (profilePicture) {
            // Convert the buffer to a base64 string
            const base64String = profilePicture.toString('base64');
            return `data:image/jpeg;base64,${base64String}`; // Adjust to image format (jpeg/png)
        } else {
            return "https://via.placeholder.com/150"; // Fallback if no image
        }
    };

    // Profile image state
    const [profileImage, setProfileImage] = useState(getProfileImage(selectedDentist.ProfilePicture));

    useEffect(() => {
        setProfileImage(getProfileImage(selectedDentist.ProfilePicture));
    }, [selectedDentist]);

    useEffect(() => {
        if (isOpen && selectedDentist) {
            setDentistData({
                FirstName: selectedDentist.FirstName || '',
                LastName: selectedDentist.LastName || '',
                MiddleName: selectedDentist.MiddleName || '',
                ContactNumber: selectedDentist.ContactNumber || '',
                Address: selectedDentist.Address || '',
                Gender: selectedDentist.Gender || '',
                LicenseNo: selectedDentist.LicenseNo || '',
                ProfilePicture: null,
            });
            // setProfileImage(selectedDentist.ProfilePicture ? `` : "https://via.placeholder.com/150");
        }
    }, [isOpen, selectedDentist]);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setDentistData((prevData) => ({
    //         ...prevData,
    //         [name]: value,
    //     }));
    // };
    const handleChange = (e) => {
        const { name, value } = e.target;

        // If the field is 'ContactNumber', limit the value to 11 digits
        if (name === 'ContactNumber') {
            // Remove any non-digit characters and limit to 11 digits
            const cleanValue = value.replace(/\D/g, '').slice(0, 11);
            setDentistData((prevData) => ({
                ...prevData,
                [name]: cleanValue,
            }));
        } else {
            setDentistData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setDentistData((prevData) => ({
            ...prevData,
            ProfilePicture: file,
        }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(dentistData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await axios.put(`${BASEURL}/dentist/Dentistdata/update/${selectedDentist._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
console.log(response.data)
            updateDentistData(response.data);

            showToast('success', 'Edit successful!');

            onClose();
        } catch (error) {
            console.error("Error updating dentist data:", error);
        }
    };

    if (!isOpen) return null;

    const handleEditNewClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-center">Edit Dentist Information</h2>
                <div className="mb-4 flex justify-center items-center relative">
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full"
                    />
                    <button
                        type="button"
                        onClick={handleEditNewClick}
                        className="absolute bottom-2 left-90 bg-gray-500 text-white rounded-full px-2 py-1"
                    >
                        <span className="material-symbols-outlined">photo_camera_front</span>
                    </button>


                    <input
                        type="file"
                        name="ProfilePicture"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                    />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='grid grid-cols-3 gap-3'>
                        <div>
                            <label className="block mb-1 font-semibold">First Name</label>
                            <input
                                type="text"
                                name="FirstName"
                                value={dentistData.FirstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                required
                                className="border border-gray-300 bg-gray-100 rounded-md p-2 w-full focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">Last Name</label>
                            <input
                                type="text"
                                name="LastName"
                                value={dentistData.LastName}
                                onChange={handleChange}
                                placeholder="Last Name"
                                required
                                className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">Middle Name</label>
                            <input
                                type="text"
                                name="MiddleName"
                                value={dentistData.MiddleName}
                                onChange={handleChange}
                                placeholder="Middle Name"
                                className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">Contact Number</label>
                            <input
                                type="text"  // Use text type to handle custom validation
                                name="ContactNumber"
                                value={dentistData.ContactNumber}
                                onChange={handleChange}
                                placeholder="Contact Number"
                                required
                                maxLength={11}  // Maximum of 11 characters (digits)
                                pattern="\d{11}" // Only allows 11 digits
                                className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold">Address</label>
                            <input
                                type="text"
                                name="Address"
                                value={dentistData.Address}
                                onChange={handleChange}
                                placeholder="Address"
                                className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">Gender</label>
                            <select
                                name="Gender"
                                value={dentistData.Gender}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2  w-full bg-gray-100 focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                {/* <option value="Non-binary">Non-binary</option>
                                <option value="Genderqueer">Genderqueer</option>
                                <option value="Transgender">Transgender</option>
                                <option value="Genderfluid">Genderfluid</option>
                                <option value="Agender">Agender</option>
                                <option value="Two-spirit">Two-spirit</option>
                                <option value="Other">Other</option> */}
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">License No.</label>
                            <input
                                type="text"
                                name="LicenseNo"
                                value={dentistData.LicenseNo}
                                onChange={handleChange}
                                placeholder="License No."
                                className="border border-gray-300 rounded-md p-2 mb-4 w-full bg-gray-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button type="button" onClick={onClose} className="bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white rounded-md px-4 py-2">Cancel</button>
                        <button type="submit" className="bg-[#025373] hover:bg-[#03738C] text-white rounded-md px-4 py-2">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
