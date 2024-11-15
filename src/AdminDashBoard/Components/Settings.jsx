import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Setthings = () => {
    const navigate = useNavigate();
    const [settingsIsOpen, setSettingsIsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null); // Ref for the dropdown

    const handleSettings = (path) => {
        if (path === '/UnavailableClinic') {
            navigate(path);
        }
        setSettingsIsOpen(false); // Close the dropdown after navigating
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false); // Close modal after navigation
    };

    // Close dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSettingsIsOpen(false); // Close the dropdown
            }
        };

        // Attach event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Clean up the event listener on unmount
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div>
            <div className="relative">
                <button
                    onClick={() => setSettingsIsOpen(!settingsIsOpen)} 
                    className="text-xl font-semibold text-black btn-ghost btn-circle relative"
                    title="Settings"
                >
                    <span className="material-symbols-outlined">settings</span>
                </button>
                
                {settingsIsOpen && (
                    <div ref={dropdownRef} className="absolute z-10 w-48 bg-white rounded-lg shadow-lg right-0">
                        <button
                            onClick={() => setIsOpen(true)} 
                            className='w-full h-12 text-black border-full bg-[#96D2D9] hover:bg-gray-100 flex items-center justify-start space-x-2 rounded-t-lg px-4'
                        >
                            <span className="material-symbols-outlined">edit</span>
                            <span>Edit Blog Page</span>
                        </button>
                        <button
                            onClick={() => handleSettings('/UnavailableClinic')} // Navigate to the unavailable clinic page
                            className="w-full text-left px-4 py-2 text-black bg-[#96D2D9] hover:bg-gray-100  border-white  rounded-b-lg flex items-center space-x-2"
                        >
                            <span className="material-symbols-outlined">event_busy</span>
                            <span>Clinic Close</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Blog Modal */}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <dialog className="modal" open>
                        <div className="modal-box relative bg-[#ffffff] p-4 rounded-lg">
                            <button
                                type="button"
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                            <h3 className="font-bold text-xl text-[#00000] text-center">Edit Blog Page</h3>
                            <ul className="ml-8 mt-5 space-y-1 text-black">
                                <li
                                    className="p-2 rounded cursor-pointer flex items-center hover:bg-[#96D2D9] transition"
                                    onClick={() => handleNavigate('/Grouplist')}
                                >
                                    <span className="material-symbols-outlined mr-2">person</span>
                                    Edit Group Member
                                </li>
                                <li
                                    className="p-2 rounded cursor-pointer flex items-center hover:bg-[#96D2D9] transition"
                                    onClick={() => handleNavigate('/Contactus_edit')}
                                >
                                    <span className="material-symbols-outlined mr-2">call</span>
                                    Edit Contact Us
                                </li>
                                <li
                                    className="p-2 rounded cursor-pointer flex items-center hover:bg-[#96D2D9] transition"
                                    onClick={() => handleNavigate('/Hero_edit')}
                                >
                                    <span className="material-symbols-outlined mr-2">info</span>
                                    Edit Hero
                                </li>
                                <li
                                    className="p-2 rounded cursor-pointer flex items-center hover:bg-[#96D2D9] transition"
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
        </div>
    );
};

export default Setthings; // Ensure to export your component
