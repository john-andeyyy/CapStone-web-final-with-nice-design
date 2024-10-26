import React, { useState } from 'react';
import Dashboard_Announcement from './Dashboard components/Dashboard_Announcement';
import Dashboard_Calendar from './Dashboard components/Dashboard_Calendar';
import { useNavigate } from 'react-router-dom';
import DashboardTips from './Dashboard components/DashboardTips';

export default function Dashboard() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [settingsIsOpen, setSettingsIsOpen] = useState(false);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    
    };

    const handleSettings = (path) => {
        navigate(path);

        setSettingsIsOpen(false);
    };

    return (
        <div className="p-4">
           <div className="grid grid-cols-2 items-center"> {/* Use grid layout for columns */}
    <div className="flex flex-col">
        <header>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="text-gray-600">{formattedDate}</div>
        </header>
    </div>
    <div className="flex justify-end"> {/* Flex container for button alignment */}
        <button
            onClick={() => navigate('/Total_procedures')}
            className='bg-[#3EB489] hover:bg-[#62A78E] h-12 rounded-xl text-xl font-semibold text-white transition duration-300 p-2 flex items-center justify-center space-x-2'
        >
            <span className="material-symbols-outlined">
                summarize
            </span>
            <span>Report Overview</span>
        </button>
    </div>
</div>


            {/* Responsive Container for Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-5">
    {/* Left Column */}
    <div className="flex flex-col col-span-1 lg:col-span-1">
        {/* Announcement Section */}
        <div className="w-full p-4 border border-primary rounded-lg mb-4">
            <Dashboard_Announcement />
        </div>

        {/* Tips Section */}
        <div className="w-full p-4 border border-primary rounded-lg">
            <DashboardTips />
        </div>
    </div>

    {/* Right Column - Full Height Calendar */}
    <div className="w-full p-4 border border-primary bg-[#3EB489] rounded-lg col-span-1 lg:col-span-2">
        <Dashboard_Calendar />
        <span className='text-7xl uppercase flex justify-center items-center mt-10 text-white font-serif font-semibold'>Calendar</span>
    </div>

    {/* <div className="relative mt-5">
                <button
                    onClick={() => setSettingsIsOpen(!settingsIsOpen)} // Toggle dropdown visibility
                    className=' text-xl font-semibold text-black'
                    title='settings'
                >
                    <span class="material-symbols-outlined">
                        settings
                        </span>
                </button> */}

                {/* Dropdown Menu */}
                {/* {settingsIsOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg">
                        <button
                            onClick={() => handleSettings('/EditBlogPage')} // Add your edit blog page path
                            className='block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-200'
                        >
                            <span className="material-symbols-outlined">
                                edit
                            </span>
                            Edit BlogPage
                        </button>
                        <button
                            onClick={() => handleSettings('/UnavailableClinic')} // Navigate to the unavailable clinic page
                            className='block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-200'
                        >
                            <span className="material-symbols-outlined">
                                event_busy
                            </span>
                            Clinic Close
                        </button>
                    </div>
                )} */}
                {/* </div> */}




                {/* Second Row */}
                

                {/* <div className="p-4 border border-primary rounded-lg flex flex-col justify-center items-center space-y-4">

                    <button
                        onClick={() => setIsOpen(true)}
                        className='bg-[#3EB489] w-full h-12 rounded-xl text-xl font-semibold text-white transition duration-300 hover:bg-green-600 flex items-center justify-center space-x-2'
                    >
                        <span className="material-symbols-outlined">
                            edit
                        </span>
                        Edit BlogPage
                    </button>
                    <button
                        onClick={() => navigate('/UnavailableClinic')}
                        className='bg-[#3EB489] w-full h-12 rounded-xl text-xl font-semibold text-white transition duration-300 hover:bg-green-600 flex items-center justify-center space-x-2'
                    >
                        <span className="material-symbols-outlined">
                            event_busy
                        </span>
                        <span>Clinic Close</span>
                    </button>
                </div> */}



            </div>

            {/* Modal for Editing BlogPage
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <dialog className="modal" open>
                        <div className="modal-box relative bg-[#C6E4DA] p-4 rounded-lg">
                            <button
                                type="button"
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                            <h3 className="font-bold text-lg text-[#266D53] text-center">Edit BlogPage</h3>
                            <ul className="ml-8 mt-2 space-y-1 text-gray">
                                <li
                                    className="p-2 rounded cursor-pointer flex items-center hover:bg-secondary transition"
                                    onClick={() => handleNavigate('/Grouplist')}
                                >
                                    <span className="material-symbols-outlined mr-2">person</span>
                                    Edit Group Member
                                </li>
                                <li
                                    className="p-2 rounded cursor-pointer flex items-center hover:bg-secondary transition"
                                    onClick={() => handleNavigate('/Contactus_edit')}
                                >
                                    <span className="material-symbols-outlined mr-2">call</span>
                                    Edit Contact Us
                                </li>
                                <li
                                    className="p-2 rounded cursor-pointer flex items-center hover:bg-secondary transition"
                                    onClick={() => handleNavigate('/Hero_edit')}
                                >
                                    <span className="material-symbols-outlined mr-2">info</span>
                                    Edit Hero
                                </li>
                                <li
                                    className="p-2 rounded cursor-pointer flex items-center hover:bg-secondary transition"
                                    onClick={() => handleNavigate('/TipsList')}
                                >
                                    <span className="material-symbols-outlined mr-2">recommend</span>
                                    Edit TIPS
                                </li>
                            </ul>
                        </div>
                    </dialog>
                </div>
            )}
        </div> */}
        </div>
    );
}
