import React, { useEffect, useState } from 'react';
import {
    FaHome, FaCalendarAlt, FaUser, FaFileAlt,
    FaUserPlus, FaPlus, FaSignOutAlt, FaBars,
    FaTimes, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { get_profile } from './Fetchs/Admin/admin_profile';
import ThemeController from '../Guest/GuestComponents/ThemeController';
import Daisyui_modal from './Components/Daisyui_modal';
import axios from 'axios';

import Swal from 'sweetalert2';
export default function Sidebar() {
    const localrole = localStorage.getItem('Role')
    const [RoleType, setRoletype] = useState(localrole.toLocaleLowerCase())

    const BASEURL = import.meta.env.VITE_BASEURL;

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

    const toggleLandingPageDropdown = () => {
        setIsLandingPageDropdownOpen(!isLandingPageDropdownOpen);
        setIsAppointmentsDropdownOpen(false);
        setIsMedicalRequestsDropdownOpen(false);
    };

    const toggleMedicalRequestsDropdown = () => {
        setIsMedicalRequestsDropdownOpen(!isMedicalRequestsDropdownOpen);
        setIsAppointmentsDropdownOpen(false);
        setIsLandingPageDropdownOpen(false);
    };

    const handleLogout = () => {
        Swal.fire({
            //background: '#96D2D9', // Set the background color
            title: 'Log Out Confirmation',
            text: "Are you sure you want to log out? This will end your current session.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#025373',
            cancelButtonColor: '#ADAAAA',
            confirmButtonText: 'Yes, log out!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear local storage and navigate
                localStorage.clear();
                navigate('/');
                window.location.reload();

                // Send logout request to server
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
        <div className='text-white z-40'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 text-primary"
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <div className={`fixed  h-screen w-60 bg-[#032742] p-4 flex flex-col justify-between transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div>
                    {/* <div className="flex justify-between items-center pb-3"> */}
                    {/* <button className="" onClick={() => setIsModalOpen(true)}>
                            <span className="material-symbols-outlined text-red-500">logout</span>
                        </button> */}


                    <h2 className="text-xl uppercase font-serif font-bold mt-5 mb-5 text-center md:block">
                        <span className='text-white'>{dentalname.DentalName}</span> <span className='text-[#96D2D9]'>Clinic</span>
                    </h2>
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
                        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                    {/* </div> */}

                    <div className="flex flex-col items-center pb-3" onClick={handleImageClick}>
                        <div className="avatar">
                            <div className="w-20 h-20 rounded-full cursor-pointer overflow-hidden">
                                <img src={profilePic} alt="Profile" className="object-cover w-full h-full" />
                            </div>
                        </div>
                        <span className="font-semibold text-center mt-2 text-white">{name}</span>
                    </div>

                    <div className="flex-grow text-white">
                        <ul className="space-y-2 text-sm">

                            {/* //! DENTIST NAV BAR */}
                            {RoleType == 'dentist' && (

                                <div>
                                    {/* <h1 className='text-2xl text-red-500'>dentist view only <span>icon</span> </h1> */}
                                    <li className={`flex items-center p-2 rounded cursor-pointer mt-10 ${activeItem === 'DentistAppointment' ? 'bg-[#0071b1] text-gray-800' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/DentistSchedule', 'DentistSchedule')}>
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

                            {RoleType == 'admin' && (
                                <div>
                                    {/* <h1>for admin only</h1> */}


                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'general' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/dashboard', 'general')}>
                                        <FaHome className="mr-3" />
                                        <span>General</span>
                                    </li>

                                    {/* Appointments Dropdown */}
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


                                    {/* <li className="relative"> */}
                                    {/* <div className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'medical-requests' ? 'bg-secondary text-gray-800' : 'hover:bg-secondary'}`} onClick={toggleMedicalRequestsDropdown}>
                                    <FaFileAlt className="mr-3" />
                                    <span>Documents</span>
                                    {isMedicalRequestsDropdownOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
                                </div> */}

                                    {/* {isMedicalRequestsDropdownOpen && (
                                    // <ul className="ml-3 mt-2 space-y-1">
                                        {/* <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'medical-requests' ? 'bg-secondary text-gray-800' : 'hover:bg-secondary'}`} onClick={() => handleNavigate('/Medical_requests', 'medical-requests')}> */}
                                    {/* <FaFileAlt className="pr-1" /> */}
                                    {/* <span>Dental Certificate Requests</span> */}
                                    {/* </li> */}
                                    {/* <li className={`p-2 rounded cursor-pointer flex items-center ${activeItem === 'completedRequests' ? 'bg-secondary text-gray-800' : 'hover:bg-secondary'}`} onClick={() => handleNavigate('/Medical_requests/completed', 'completedRequests')}>
                                            <span className="material-symbols-outlined mr-2">done</span>
                                            Completed Requests
                                        </li> */}
                                    {/* </ul> */}


                                    {/* </li> */}

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'add-procedure' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/Add_Procedure', 'add-procedure')}>
                                        <FaPlus className="mr-3" />
                                        <span> Services</span>
                                    </li>

                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'Dentist' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/Dentist', 'Dentist')}>
                                        <FaUser className="mr-3" />
                                        <span>Dentist</span>
                                    </li>
                                    <li className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'Reports' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'}`} onClick={() => handleNavigate('/Total_procedures', 'Reports')}>
                                        <FaFileAlt className="mr-3" />
                                        <span>Reports</span>
                                    </li>



                                    {/* Landing Page Dropdown */}
                                    {/* <li className="relative">
                                <div className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'landing-page' ? 'bg-secondary text-gray-800' : 'hover:bg-secondary'}`} onClick={toggleLandingPageDropdown}>
                                    <span className="material-symbols-outlined mr-2">home</span>
                                    <span>Landing Page</span>
                                    {isLandingPageDropdownOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
                                </div>


                                {isLandingPageDropdownOpen && (
                                    <ul className="ml-8 mt-2 space-y-1">
                                        <li
                                            className={`p-2 rounded cursor-pointer flex items-center ${activeItem === 'AddGroupMember' ? 'bg-secondary text-gray-800' : 'hover:bg-secondary'}`}
                                            onClick={() => handleNavigate('/Grouplist', 'Grouplist')}
                                        >
                                            <span className="material-symbols-outlined mr-2">
                                                person
                                            </span>
                                            Group Member
                                        </li>
                                        <li
                                            className={`p-2 rounded cursor-pointer flex items-center ${activeItem === 'Contactus_edit' ? 'bg-secondary text-gray-800' : 'hover:bg-secondary'}`}
                                            onClick={() => handleNavigate('/Contactus_edit', 'Contactus_edit')}
                                        >
                                            <span className="material-symbols-outlined mr-2">
                                                contacts
                                            </span>
                                            Contact us Edit
                                        </li>

                                    </ul>
                                )}
                            </li> */}

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
