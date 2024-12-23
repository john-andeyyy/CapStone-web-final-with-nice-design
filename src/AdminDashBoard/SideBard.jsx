import React, { useEffect, useState } from 'react';
import {
    FaHome, FaCalendarAlt, FaUser, FaFileAlt,
    FaUserEdit, FaPlus, FaSignOutAlt, FaBars,
    FaTimes, FaChevronDown, FaChevronUp,

} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import Daisyui_modal from './Components/Daisyui_modal';
import axios from 'axios';

import Swal from 'sweetalert2';
export default function Sidebar() {
    const localrole = localStorage.getItem('Role')
    const [RoleType, setRoletype] = useState(localrole.toLocaleLowerCase())
    const BASEURL = import.meta.env.VITE_BASEURL || 'http://localhost:3000';
    
    const [isOpen, setIsOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('general');
    const [profilePic, setProfilePic] = useState('../../public/default-avatar.jpg');
    const [name, setName] = useState('name');
    const [isMedicalRequestsDropdownOpen, setIsMedicalRequestsDropdownOpen] = useState(false);
    const [isAppointmentsDropdownOpen, setIsAppointmentsDropdownOpen] = useState(false);
    const [isLandingPageDropdownOpen, setIsLandingPageDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchProfile = async () => {
        try {
            const temp_response = await axios.get(`${BASEURL}/Admin/auth/Admin`,
                {
                    withCredentials: true
                }
            )
            const response = temp_response.data
            setProfilePic(response.ProfilePicture || profilePic);
            setName(response.FirstName || 'Default name');

        } catch (error) {
            console.error('Error fetching profile:', error);
        }

    };
    const [dentalname, setdentalname] = useState([]);

    useEffect(() => {
        fetchProfile();
        const BASEURL = import.meta.env.VITE_BASEURL;

        axios.get(`${BASEURL}/Contactus/contactus`)
            .then(response => {
                if (response.data.length > 0) {
                    setdentalname(response.data[0]);
                }
            })
            .catch(error => {
                console.error('There was an error fetching the contact data:', error);
            });
    }, []);

    const handleNavigate = (path, item) => {
        setActiveItem(item);
        navigate(path);
        closeDropdowns();
    };

    const handleImageClick = () => {
        setActiveItem('');
        navigate('/ProfilePage');
        closeDropdowns();
    };

    const closeDropdowns = () => {
        setIsOpen(false);
        setIsAppointmentsDropdownOpen(false);
        setIsLandingPageDropdownOpen(false);
        setIsMedicalRequestsDropdownOpen(false);
    };

    const toggleAppointmentsDropdown = () => {
        setIsAppointmentsDropdownOpen(!isAppointmentsDropdownOpen);
        setIsLandingPageDropdownOpen(false);
        setIsMedicalRequestsDropdownOpen(false);
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Log Out Confirmation',
            text: "Are you sure you want to log out? ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#025373',
            cancelButtonColor: '#ADAAAA',
            reverseButtons: true,
            confirmButtonText: 'Yes, log out!'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                navigate('/');
                window.location.reload();

                axios.post(`${BASEURL}/Admin/auth/Logout`, {}, { withCredentials: true })
                    .then((res) => {
                        if (res.status === 200) {
                            console.log('Successfully logged out');
                        }
                    })
                    .catch((error) => {
                        console.error('Logout error:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'There was an issue logging out. Please try again.',
                            icon: 'error',
                            confirmButtonColor: '#025373'
                        });
                    });
            }
        });
    };
    return (
        <div className='text-white z-10'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 text-primary"
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <div className={`fixed  h-screen w-60 bg-[#032742] p-4 flex flex-col justify-between transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div>
                    <h2 className="text-xl uppercase font-serif font-bold mt-5 mb-5 text-center md:block">
                        {dentalname?.DentalName?.includes('Clinic') ? (
                            <span className="text-white">
                                {dentalname.DentalName.split('Clinic')[0]}
                                <span className="text-[#96D2D9]">Clinic</span>
                                {dentalname.DentalName.split('Clinic')[1]}
                            </span>
                        ) : (
                            <>
                                <span className="text-white">{dentalname?.DentalName || 'Default Name'}</span>
                                <span className="text-[#96D2D9]"> Clinic</span>
                            </>
                        )}
                    </h2>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
                        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>

                    <div className="flex flex-col items-center pb-3 py-5 " onClick={handleImageClick}>
                        <div className="avatar">
                            <div className="w-20 h-20 rounded-full cursor-pointer overflow-hidden">
                                <img src={profilePic} alt="Profile" className="object-cover w-full h-full" />
                            </div>
                        </div>
                        <span className="font-semibold text-center mt-2 text-white"> {name}</span>
                    </div>

                    <div className="flex-grow text-white">
                        <ul className="space-y-2 text-sm">

                            {/* //! DENTIST NAV BAR */}
                            {RoleType == 'dentist' && (

                                <div>
                                    <li className={`flex items-center p-2 rounded cursor-pointer mt-10 ${activeItem === 'DentistSchedule' ? 'bg-[#0071b1]  text-white ' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/DentistSchedule', 'DentistSchedule')}>
                                        <FaHome className="mr-3" />
                                        <span>My Appointments</span>
                                    </li>

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'DentistPatient' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/DentistPatient', 'DentistPatient')}>
                                        <FaUser className="mr-3" />
                                        <span>Dentist's Patients</span>
                                    </li>
                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'DentistReport' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/DentistReport', 'DentistReport')}>
                                        <FaUser className="mr-3" />
                                        <span>My Reports</span>
                                    </li>

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'patients' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/patients', 'patients')}>
                                        <FaUser className="mr-3" />
                                        <span>Patients List</span>
                                    </li>
                                </div>

                            )}
                            {/* //! ADMIN NAV BAR */}

                            {(RoleType == 'admin' || RoleType == 'staff') && (
                                <div className='space-y-1'>
                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'general' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/dashboard', 'general')}>
                                        <FaHome className="mr-3" />
                                        <span>General</span>
                                    </li>

                                    <li className="relative">
                                        <div className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'appointments' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={toggleAppointmentsDropdown}>
                                            <FaCalendarAlt className="mr-3" />
                                            <span>Appointments</span>
                                            {isAppointmentsDropdownOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
                                        </div>


                                        {isAppointmentsDropdownOpen && (
                                            <ul className="ml-8 mt-2 space-y-1">
                                                <li className={`p-2 rounded cursor-pointer flex items-center ${activeItem === 'appointmentList' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/appointments', 'appointmentList')}>
                                                    <span className="material-symbols-outlined mr-2">event_available</span>
                                                    Appointments
                                                </li>
                                                <li className={`p-2 rounded cursor-pointer flex items-center ${activeItem === 'calendar' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/CalendarComponent', 'calendar')}>
                                                    <span className="material-symbols-outlined mr-2">calendar_month</span>
                                                    Calendar
                                                </li>
                                                <li className={`p-2 rounded cursor-pointer flex items-center ${activeItem === 'Create-appointment' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/Create-appointment', 'Create-appointment')}>
                                                    <span className="material-symbols-outlined mr-2">calendar_month</span>
                                                    Create appointment
                                                </li>
                                            </ul>
                                        )}
                                    </li>

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'patients' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/patients', 'patients')}>
                                        <FaUser className="mr-3" />
                                        <span>Patients</span>
                                    </li>

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'medical-requests' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/Medical_requests', 'medical-requests')}>
                                        <FaFileAlt className="mr-3" />
                                        <span>Dental Certificate Requests</span>
                                    </li>

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'add-procedure' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/Add_Procedure', 'add-procedure')}>
                                        <FaPlus className="mr-3" />
                                        <span> Services</span>
                                    </li>

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'Dentist' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/Dentist', 'Dentist')}>
                                        <FaUser className="mr-3" />
                                        <span>Dentist</span>
                                    </li>
                                    <li className="relative">
                                        {/* Manage Accounts Header */}

                                        {RoleType == 'admin' && (


                                            <div
                                                className={`flex items-center p-2 rounded cursor-pointer ${activeItem === "manageAccounts" ? "bg-[#0071b1] text-white" : "hover:bg-[#0071b1]"
                                                    }`}
                                                onClick={() => setActiveItem(activeItem === "manageAccounts" ? "" : "manageAccounts")}
                                            >
                                                <FaUserEdit className="mr-3" />
                                                <span>Manage Accounts</span>
                                                {activeItem === "manageAccounts" ? (
                                                    <FaChevronUp className="ml-auto" />
                                                ) : (
                                                    <FaChevronDown className="ml-auto" />
                                                )}
                                            </div>
                                        )}

                                        {activeItem === "manageAccounts" && (
                                            <ul className="ml-8 mt-2 space-y-1">
                                                <li
                                                    className={`flex items-center p-2 rounded cursor-pointer ${activeItem === "manage-patients" ? "bg-[#0071b1] text-white" : "hover:bg-[#0071b1]"
                                                        }`}
                                                    onClick={() => handleNavigate("/patients-manage", "manage-patients")}
                                                >
                                                    <FaUser className="mr-3" />
                                                    <span>Manage Patients</span>
                                                </li>
                                                <li
                                                    className={`flex items-center p-2 rounded cursor-pointer ${activeItem === "staff" ? "bg-[#0071b1] text-white" : "hover:bg-[#0071b1]"
                                                        }`}
                                                    onClick={() => handleNavigate("/ManageStaff", "staff")}
                                                >
                                                    <FaUserEdit className="mr-3" />
                                                    <span>Manage Staff</span>
                                                </li>
                                            </ul>
                                        )}
                                    </li>

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'Reports' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/Total_procedures', 'Reports')}>
                                        <FaFileAlt className="mr-3" />
                                        <span>Reports</span>
                                    </li>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="">
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-white py-2 px-4 hover:text-red-500 "
                    >
                        <span className="material-symbols-outlined text-2xl mr-2">
                            logout
                        </span>
                        Logout
                    </button>
                </div>

            </div>
            <Daisyui_modal isOpen={isModalOpen} setIsOpen={setIsModalOpen} handleLogout={handleLogout} />
        </div>
    );
}
