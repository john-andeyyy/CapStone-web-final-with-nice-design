import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Components/Modal'; // Import your Modal component
import { showToast } from '../Components/ToastNotification';
import Swal from 'sweetalert2';

export default function AnnouncementPage() {
    const Baseurl = import.meta.env.VITE_BASEURL;

    const [announcements, setAnnouncements] = useState([]);
    const [formData, setFormData] = useState({
        isSendEmail: false,
        Title: 'Announcement!!!',
        Message: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // State to hold the selected announcement for viewing

    const FetchAnnouncement = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${Baseurl}/Announcement/announcementMessageonly`, { withCredentials: true });
            const filtered = response.data
            setAnnouncements(filtered.reverse());
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        FetchAnnouncement();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Show SweetAlert loading spinner
        Swal.fire({
            title: 'Sending Announcement...',
            html: 'Please wait while we send your announcement.',
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
                // Handle any clean-up if necessary
            }
        });

        axios.post(`${Baseurl}/Announcement/create`, formData, { withCredentials: true })
            .then(response => {
                // Close the SweetAlert loading spinner
                Swal.close();

                showToast('success', 'Announcement sent successfully');
                setFormData({
                    isSendEmail: false,
                    Title: 'Announcement!!!',
                    Message: ''
                });
                FetchAnnouncement();
                setShowModal(false);
            })
            .catch(error => {
                // Close the SweetAlert loading spinner on error
                Swal.close();
                console.error('Error sending announcement:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong, please try again.',
                });
            });
    };

    const openAnnouncementModal = (announcement) => {
        setSelectedAnnouncement(announcement);
        setShowModal(true); // Show the modal with announcement details
    };

    const closeAnnouncementModal = () => {
        setSelectedAnnouncement(null);
        setShowModal(false); // Hide the modal
    };

    const truncateMessage = (message, maxLength) => {
        if (message.length <= maxLength) return message;
        return message.slice(0, maxLength) + '...';
    };

    const toggleAnnouncementExpand = (announcementId) => {
        setExpandedAnnouncement(prevId => (prevId === announcementId ? null : announcementId));
    };

    return (
        <div className="container mx-auto p-4">

            <Modal isOpen={showModal} onClose={closeAnnouncementModal}>
                {selectedAnnouncement ? (
                    <>
                        <div className="absolute top-2 right-3">
                            <button
                                onClick={closeAnnouncementModal}
                                className="mt-4 text-gray-500 px-4 py-2"
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </div>

                        <h3 className="font-bold text-lg md:text-xl lg:text-2xl text-center mt-5">
                            {selectedAnnouncement.Title}
                        </h3>
                        <p className="mt-2 text-sm md:text-base">{selectedAnnouncement.Message}</p>
                        <p className="mt-4 text-xs md:text-sm text-gray-500">
                            Created At: {selectedAnnouncement.createdAt}
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className=" text-center mb-5 font-bold text-lg md:text-xl">Send Announcement!</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Title:</label>
                                <input
                                    type="text"
                                    name="Title"
                                    value={formData.Title}
                                    onChange={handleChange}
                                    required
                                        className="capitalize w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                                    placeholder="Enter announcement title"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Message:</label>
                                <textarea
                                    name="Message"
                                    value={formData.Message}
                                    onChange={handleChange}
                                    required
                                        className=" capitalize w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                                    placeholder="Enter announcement message"
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isSendEmail"
                                        checked={formData.isSendEmail}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    Send Email
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="submit"
                                    className="bg-[#025373] hover:bg-[#03738C] text-white px-4 py-2 rounded"
                                >
                                    Send Announcement
                                </button>

                                <button
                                    type="button"
                                    onClick={closeAnnouncementModal}
                                    className="text-white px-4 py-2 rounded bg-[#ADAAAA] hover:bg-[#D9D9D9]"
                                >
                                    Close
                                </button>


                            </div>
                        </form>
                    </>
                )}
            </Modal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* <h2 className="text-3xl font-bold">Announcements</h2> */}
                <div className="">
                    
                    {localStorage.getItem('Role') !== 'dentist' && (  
                        <button
                        className="btn text-white px-2 py-1 rounded bg-[#025373] hover:bg-[#03738C]"
                        onClick={() => setShowModal(true)}
                        >
                        Send New Announcement
                    </button>
                    )}

                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center">
                    <p className="text-gray-500">Loading announcements...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.length > 0 ? (
                        announcements.map(announcement => (
                            <div
                                key={announcement._id}
                                className="border p-4 rounded-lg cursor-pointer bg-[#96D2D9] hover:bg-gray-100"
                                onClick={() => openAnnouncementModal(announcement)}
                            >
                                <h3 className="font-semibold text-black text-sm md:text-base lg:text-lg">
                                    {announcement.Title}
                                </h3>
                                <p
                                    className={`text-gray-600 overflow-hidden ${expandedAnnouncement === announcement._id ? 'h-auto' : 'h-16'}`}
                                >
                                    {expandedAnnouncement === announcement._id
                                        ? announcement.Message
                                        : truncateMessage(announcement.Message, 100)}
                                    {announcement.Message.length > 100 && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAnnouncementExpand(announcement._id);
                                            }}
                                            className="text-black font-semibold cursor-pointer"
                                        >
                                            {expandedAnnouncement === announcement._id ? ' Hide' : ' See more'}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs md:text-sm text-gray-600">{announcement.createdAt}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center">No announcements available</p>
                    )}
                </div>
            )}
        </div>

    );
}
