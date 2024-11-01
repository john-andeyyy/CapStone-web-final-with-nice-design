import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ThemeController from '../../Guest/GuestComponents/ThemeController';
import Settings from '../Components/Settings';
import NotificationModal from '../Components/Modal'; // Import the modal
import Socket from '../../Utils/Socket';
import { showToast } from '../../AdminDashBoard/Components/ToastNotification';
const NotificationBell = () => {
    const Baseurl = import.meta.env.VITE_BASEURL;
    const navigate = useNavigate();
    const dropdownRef = useRef(null); // Ref for the dropdown
    const modalRef = useRef(null); // Ref for the modal
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Fetch notifications from the server
    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${Baseurl}/Notification/admin/AdminNotif`, {
                withCredentials: true,
            });
            const adminNotifications = response.data.filter(notification => notification.adminOnly === true);

            setNotifications(adminNotifications.reverse());
            const unreadNotifications = adminNotifications.filter(notification => !notification.adminisRead);
            setUnreadCount(unreadNotifications.length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
    const [hasShownErrorToast, setHasShownErrorToast] = useState(false);

    useEffect(() => {
        fetchNotifications();

        // Listen for new notifications via socket
        Socket.on('new-admin-notification', addNotificationToUI);
        Socket.on('disconnect', () => console.log('Disconnected from server'));

        // Clean up socket event listeners on unmount
        return () => {
            Socket.off('new-admin-notification', addNotificationToUI);
        };
    }, [Baseurl]);


    const addNotificationToUI = (notification) => {
        showToast('success', 'New Appointment sent');

        // if (!hasShownErrorToast) {
        //     setTimeout(() => {
        //         showToast('error', 'I Miss you Boss');
        //         setHasShownErrorToast(true); // Set the flag to true after showing
        //     }, 4000);
        // }


        setNotifications((prevNotifications) => {
            const updatedNotifications = [notification, ...prevNotifications];
            const unreadNotifications = updatedNotifications.filter(notif => !notif.adminisRead);
            setUnreadCount(unreadNotifications.length);
            return updatedNotifications;
        });
    };



    const toggleDropdown = () => {
        fetchNotifications(); // Refresh notifications when dropdown is opened
        setIsOpen(!isOpen);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.adminisRead) {
            await markAsRead(notification._id);
        }
        setSelectedNotification(notification);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const markAsRead = async (notifId) => {
        try {
            await axios.put(`${Baseurl}/Notification/admin/adminmarkas`, {
                notifid: notifId,
                mark_as: true,
            }, {
                withCredentials: true,
            });
            fetchNotifications(); // Refresh notifications after marking as read
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };



    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative flex justify-end items-center ">
            <Settings />
            <button className="btn btn-ghost btn-circle relative" onClick={toggleDropdown}>
                <div className="indicator" title='notification'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                    <span className="badge badge-xs badge-primary indicator-item">{unreadCount}</span>
                </div>
            </button>

            {isOpen && (
                <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-80 bg-neutral shadow-lg rounded-lg z-10 overflow-hidden">
                    <div className="p-3 text-lg border-b border-gray-200 flex justify-between">
                        <div>Notifications</div>
                        <button onClick={() => {
                            navigate('/Annoucement_Notification');
                            toggleDropdown();
                        }}>
                            view all
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">No new notifications</div>
                        ) : (
                            <ul className="p-2 pr-0 pt-0">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification._id}
                                        className={`my-1 p-3 border-b border-gray-200 hover:bg-secondary text-black cursor-pointer ${!notification.adminisRead ? 'bg-[#69dcb4] font-medium bg-opacity-50 ' : ' bg-[#69dcb4]  bg-opacity-15'}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm">{notification.user_Appointment_Title || notification.user_Appointment_message}</p>
                                                {/* <p className="text-xs text-gray-500">created at: {formatDate(notification.createdAt)}</p> */}

                                            </div>
                                            <br />
                                            <div>

                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Modal to show notification details */}
            {isModalOpen && (
                <NotificationModal isOpen={isModalOpen} onClose={closeModal}>
                    {selectedNotification && (
                        <div>
                            <h1 className='text-center text-2xl font-bold text-[#3EB489]'>Notification</h1>
                            <div className="p-4">
                                <h2 className="text-xl font-bold">{selectedNotification.user_Appointment_Title}</h2>
                                <p>{selectedNotification.user_Appointment_message}</p>
                                <div className='flex justify-evenly'>
                                    <button className="bg-[#D9D9D9] hover:bg-[#ADAAAA] btn mt-4" onClick={closeModal}>
                                        Close
                                    </button>
                                    <button className="bg-[#3EB489] hover:bg-[#3eb489b3] btn mt-4" onClick={() => {
                                        closeModal();
                                        navigate(`appointment/${selectedNotification.appointmentStatus[0].appointment_id}`);
                                    }}>
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </NotificationModal>
            )}
        </div>
    );
};

export default NotificationBell;
