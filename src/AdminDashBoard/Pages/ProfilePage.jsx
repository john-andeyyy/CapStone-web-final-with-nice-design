import React, { useEffect, useState } from 'react';
import ThemeController from '../../Guest/GuestComponents/ThemeController';
import { get_profile, update_profile } from '../Fetchs/Admin/admin_profile';
import axios from 'axios';
import { showToast } from '../../AdminDashBoard/Components/ToastNotification';

const BASEURL = import.meta.env.VITE_BASEURL;

const ProfilePage = () => {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    const [otp, setOtp] = useState('');
    const [currentpassword, setcurrentpassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        Email: '',
        FirstName: '',
        LastName: '',
        MiddleName: '',
        contactNumber: '',
        ProfilePicture: null,
        Username: '',
        ProfilePicturePreview: null,
    });

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isEditable, setIsEditable] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const profile = await get_profile();
            if (profile) {
                setProfile(profile);
            }
        };
        fetchProfile();
    }, []);

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(
                `${BASEURL}/Admin/auth/request-email-change`,
                {
                    newEmail,
                    currentpassword,
                },
                { withCredentials: true }
            );

            if (response.status === 200) {
                showToast('success', response.data.message);
                setShowOtpModal(true)
                setShowEmailModal(false);
                // setcurrentpassword('')
                // setNewEmail('')
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Error: ${error.response.data.message}`);
                setMessage(error.response.data.message);
            } else {
                alert('Failed to send email change request');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    ProfilePicturePreview: reader.result,
                    ProfilePicture: file,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async () => {
        const formData = new FormData();
        formData.append('Email', profile.Email);
        formData.append('FirstName', profile.FirstName);
        formData.append('LastName', profile.LastName);
        formData.append('MiddleName', profile.MiddleName);
        formData.append('contactNumber', profile.contactNumber);
        formData.append('Username', profile.Username);

        if (profile.ProfilePicture) {
            formData.append('ProfilePicture', profile.ProfilePicture);
        }

        try {
            const response = await update_profile(formData);
            if (response) {
                console.log('Profile updated successfully:', response.status);
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('An error occurred while updating the profile:', error);
        }
    };

    const handleEditToggle = () => {
        setIsEditable((prevEditable) => !prevEditable);
    };



    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setMessage('New passwords do not match.');
            return;
        }

        try {
            const response = await axios.put(`${BASEURL}/Admin/auth/Updatepass`, {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            }, {
                withCredentials: true,
            });

            if (response.status === 200) {
                showToast('success', 'Password changed successfully');

                // alert('Password changed successfully');
                setMessage('Password changed successfully');
                setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                setShowPasswordModal(false); // Close modal on success
            } else if (response.status === 401) {
                showToast('error', 'Current password is incorrect');

                // alert('Current password is incorrect');
                setMessage('Current password is incorrect');
            } else {
                // alert('Something went wrong, please try again');
                setMessage('Something went wrong, please try again');
            }
        } catch (error) {
            if (error.response) {
                alert(`Error: ${error.response.data.message}`);
                console.log('asd')
                setMessage(error.response.data.message);
            } else {
                console.log('asd')
                alert('Failed to change password');
                setMessage('Failed to change password');
            }
            console.error(error);
        }
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prevPasswords) => ({
            ...prevPasswords,
            [name]: value,
        }));

    };

    const [otpError, setotpError] = useState('')

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${BASEURL}/Admin/auth/verify-email-change-otp`, {
                otp: otp,
            }, { withCredentials: true });
            if (response.status === 200) {
                showToast('success', 'Email verification successful');

                setShowOtpModal(false);
                setotpError('')
            }
        } catch (error) {
            // console.error("Verification failed. Please check your OTP and try again.");
            setotpError('Verification failed. Please check your OTP and try again.')
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex justify-center items-center p-6">
            <div className="bg-[#F5F5F5] p-8 rounded-lg shadow-lg w-full max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#266D53]">Profile Page</h1>
                    {/* <button
                        className={`text-white px-4 py-2 rounded-md 
                            ${isEditable ? 'bg-[#3EB489] hover:bg-[#62A78E]' : 'bg-[#3EB489] hover:bg-[#62A78E]'}`}
                        onClick={handleEditToggle}
                    >
                        {isEditable ? 'Cancel' : 'Edit Profile'}
                    </button> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Picture */}
                    <div className="col-span-1 flex flex-col items-center">
                        <label className="block text-black mb-2">Profile Picture:</label>
                        {profile.ProfilePicturePreview && (
                            <img
                                src={profile.ProfilePicturePreview}
                                alt="Profile Preview"
                                className="w-40 h-40 object-cover rounded-full mb-4"
                            />
                        )}
                        {isEditable && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePicChange}
                                className="mt-2 w-full text-sm text-white"
                            />
                        )}
                    </div>

                    {/* Profile Details */}
                    <div className="col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block font-bold uppercase">First Name:</label>
                                <input
                                    type="text"
                                    name="FirstName"
                                    value={profile.FirstName}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md bg-[#D3CDCD]"
                                    readOnly={!isEditable}
                                />
                            </div>

                            <div className="form-group">
                                <label className="block font-bold uppercase">Last Name:</label>
                                <input
                                    type="text"
                                    name="LastName"
                                    value={profile.LastName}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md bg-[#D3CDCD]"
                                    readOnly={!isEditable}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block font-bold uppercase">Middle Name:</label>
                                <input
                                    type="text"
                                    name="MiddleName"
                                    value={profile.MiddleName}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md bg-[#D3CDCD]"
                                    readOnly={!isEditable}
                                />
                            </div>

                            <div className="form-group">
                                <label className="block font-bold uppercase">
                                    Email:
                                    {isEditable && (
                                        <span className="ml-4 text-[#4285F4] hover:text-[#0C65F8] cursor-pointer"
                                            onClick={() => setShowEmailModal(true)} // Open email modal
                                        >
                                            change
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="email"
                                    name="Email"
                                    value={profile.Email}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md bg-[#D3CDCD]"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block font-bold uppercase">Contact Number:</label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={profile.contactNumber}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md bg-[#D3CDCD]"
                                    readOnly={!isEditable}
                                />
                            </div>

                            <div className="form-group">
                                <label className="block font-bold uppercase">Username:</label>
                                <input
                                    type="text"
                                    name="Username"
                                    value={profile.Username}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md bg-[#D3CDCD]"
                                    readOnly={!isEditable}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <div className="bg-[#F5F5F5] w-full">
                        <div className="flex justify-between items-center">
                            <button className={`mt-8 text-white px-4 py-2 rounded-md 
                                            ${isEditable ? 'bg-red-500 hover:bg-red-600' : 'bg-[#4285F4] hover:bg-[#0C65F8]'}`}
                                onClick={handleEditToggle}
                            >
                                {isEditable ? 'Cancel' : 'Edit Profile'}
                            </button>

                            <div className='flex space-x-4 mt-4'>
                                {/* Render Change Password button only when in Edit mode */}
                                {isEditable && (
                                    <button
                                        className="mt-4 bg-[#4285F4] hover:bg-[#0C65F8] text-white px-4 py-2 rounded-md"
                                        onClick={() => setShowPasswordModal(true)} // Open change password modal
                                    >
                                        Change Password
                                    </button>
                                )}

                                {/* Save changes button, only show when in edit mode */}
                                {isEditable && (
                                    <button
                                        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                                        onClick={handleProfileUpdate}
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            {/* Email change modal */}
            {showEmailModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#C6E4DA] p-6 md:p-8 rounded-lg shadow-lg w-[90%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto h-auto">
                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#266D53] text-center">Change Email</h2>
                        <form onSubmit={handleEmailChange} className="space-y-4">
                            <div>
                                <label className="block font-medium text-[#266D53]" htmlFor="newEmail">New Email:</label>
                                <input
                                    type="email"
                                    id="newEmail"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                                    required
                                    aria-label="Enter new email"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-[#266D53]" htmlFor="currentPassword">Current Password:</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentpassword}
                                    onChange={(e) => setcurrentpassword(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                                    required
                                    aria-label="Enter current password"
                                />
                            </div>
                            <div className="flex justify-center mt-8 gap-4">
                                <button
                                    type="submit"
                                    className="bg-[#4285F4] hover:bg-[#0C65F8] text-white px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Change Email'}
                                </button>
                                <button
                                    type="button"
                                    className="bg-[#D9D9D9] hover:bg-[#ADAAAA] text-gray-700 px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                    onClick={() => setShowEmailModal(false)}
                                    aria-label="Cancel email change"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Change Password modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#C6E4DA] p-6 md:p-8 rounded-lg shadow-lg w-[90%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#266D53] text-center">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block font-medium text-[#266D53]" htmlFor="currentPassword">Current Password:</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                                    required
                                    aria-label="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-[#266D53]" htmlFor="newPassword">New Password:</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordInputChange}
                                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                                    required
                                    aria-label="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-[#266D53]" htmlFor="confirmNewPassword">Confirm New Password:</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    value={passwords.confirmNewPassword}
                                    onChange={handlePasswordInputChange}
                                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                                    required
                                    aria-label="Confirm new password"
                                />
                            </div>
                            <div className="flex justify-center mt-8 gap-4">
                                <button
                                    type="submit"
                                    className="bg-[#4285F4] hover:bg-[#0C65F8] text-white px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
                                >
                                    Change Password
                                </button>
                                <button
                                    type="button"
                                    className="bg-[#D9D9D9] hover:bg-[#ADAAAA] text-gray-700 px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                    onClick={() => setShowPasswordModal(false)}
                                    aria-label="Cancel password change"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            )}

            {showOtpModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#C6E4DA] p-6 md:p-8 rounded-lg shadow-lg w-[90%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#266D53] text-center">Verify OTP</h2>
                        <p className='text-red-500 text-center'>{otpError}</p>
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium text-[#266D53]" htmlFor="otp">OTP:</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="mt-1 p-3 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition duration-200 ease-in-out"
                                    required
                                    maxLength="6" // Restrict input to 6 characters
                                    pattern="\d{6}" // Regex pattern for 6 digits
                                    aria-label="Enter OTP"
                                    placeholder="Enter 6-digit OTP"
                                />
                            </div>
                            <div className="flex justify-center mt-8 gap-4">
                                <button
                                    type="submit"
                                    className="bg-[#4285F4] hover:bg-[#0C65F8] text-white px-6 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition duration-200 ease-in-out"
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    type="button"
                                    className="bg-[#D9D9D9] hover:bg-[#ADAAAA] text-gray-700 px-6 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition duration-200 ease-in-out"
                                    onClick={() => setShowOtpModal(false)}
                                    aria-label="Cancel verification"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ProfilePage;
