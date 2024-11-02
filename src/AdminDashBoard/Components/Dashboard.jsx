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
            <div className="grid grid-cols-2 items-center">
                <div className="flex flex-col">
                    <header>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <div className="text-gray-600">{formattedDate}</div>
                    </header>
                </div>
                <div className="flex justify-end">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-5 ">
                {/* Left Column */}
                <div className="flex flex-col col-span-1 lg:col-span-1 ">
                    {/* Announcement Section */}
                    <div className="w-full p-2 border border-primary rounded-lg mb-4 bg-green-200 bg-opacity-50">
                        <Dashboard_Announcement />
                    </div>

                    {/* Tips Section */}
                    <div className="w-full p-4 border border-primary rounded-lg bg-green-200 bg-opacity-50">
                        <DashboardTips />
                    </div>
                </div>

                {/* Right Column - Full Height Calendar */}
                <div className="w-full p-4 border border-primary bg-green-200 bg-opacity-50 rounded-lg col-span-1 lg:col-span-2">
                    {/* <div className="w-full p-4 border border-primary bg-green-200 bg-opacity-50 rounded-lg col-span-1 lg:col-span-2"> */}
                    <Dashboard_Calendar />
                    <span className="
    text-3xl
    sm:text-4xl
    md:text-5xl
    lg:text-6xl
    uppercase
    flex
    justify-center
    items-center
    mt-5
    font-serif
    font-semibold
    text-[#3EB489]
">
                        Calendar
                    </span>
                </div>
            </div>
        </div>
    );
}
