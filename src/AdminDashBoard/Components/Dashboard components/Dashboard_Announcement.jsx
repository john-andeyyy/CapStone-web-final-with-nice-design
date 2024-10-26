import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Announcement() {
    const Baseurl = import.meta.env.VITE_BASEURL;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [expandedAnnouncements, setExpandedAnnouncements] = useState({});

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${Baseurl}/Announcement/announcementMessageonly`, { withCredentials: true });
            const filtered = response.data;
            setAnnouncements(filtered.reverse().slice(0, 2));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const openModal = (announcement) => {
        setSelectedAnnouncement(announcement);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedAnnouncement(null);
    };

    const toggleExpanded = (id) => {
        setExpandedAnnouncements((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const CustomModal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-secondary rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button className="text-gray-600" onClick={onClose}>X</button>
                    </div>
                    <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="p rounded-lg">
            <div className='relative mb-4'>
                <h1 className='flex items-center text-2xl font-semibold text-[#266D53]'>
                    <span className="material-symbols-outlined text-red-500 mr-1">
                        campaign
                    </span>
                    Announcements
                </h1>

                <button
                    className='absolute top-0 right-0 font-semibold text-md'
                    onClick={() => navigate('/AnnouncementPage')}
                >
                    <span className="ml-1">See More</span>
                </button>
            </div>

            <div className="border-2 bg-accent border-[#3EB489] rounded-lg max-h-64 overflow-y-auto p-5">
                {loading ? (
                    <p className="text-center py-4">Loading announcements...</p>
                ) : announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <div key={announcement._id} className="p-2 max-h-30 border-b border-white">
                            <div className="flex justify-between items-center">
                                <h2 className="flex items-center font-semibold text-sm">
                                    <span className="material-symbols-outlined mr-2 text-error">campaign</span>
                                    {announcement.Title}
                                </h2>
                                <button className="text-[#3EB489] cursor-pointer ml-2" onClick={() => openModal(announcement)}>
                                    View
                                </button>
                            </div>
                            <div className="mb-1 text-sm">
                                {expandedAnnouncements[announcement._id] ? (
                                    <>
                                        {announcement.Message}
                                        <span className="text-secondary cursor-pointer ml-2" onClick={() => toggleExpanded(announcement._id)}>
                                            Hide
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        {announcement.Message.length > 100
                                            ? `${announcement.Message.substring(0, 100)}...`
                                            : announcement.Message}
                                        {announcement.Message.length > 100 && (
                                            <p className="text-secondary cursor-pointer ml-2 underline" onClick={() => toggleExpanded(announcement._id)}>
                                                See More
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="text-gray-500 text-xs">
                                Date Created: {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-center py-4">No announcements available.</p>
                )}
            </div>

            {/* Modal for displaying announcement details */}
            <CustomModal isOpen={modalOpen} onClose={closeModal} title={selectedAnnouncement?.Title}>
                {selectedAnnouncement && (
                    <div className='pb-3'>
                        <h2 className="font-semibold text-xl mb-2">{selectedAnnouncement.Title}</h2>
                        <p>{selectedAnnouncement.Message}</p>
                        <p className="text-gray-500 text-sm mt-4">
                            Date Created: {new Date(selectedAnnouncement.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                )}
            </CustomModal>
        </div>
    );
}
