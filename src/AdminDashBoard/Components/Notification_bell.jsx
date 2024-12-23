import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ThemeController from '../../Guest/GuestComponents/ThemeController';
import Settings from '../Components/Settings';
import NotificationModal from '../Components/Modal';
import Socket from '../../Utils/Socket';
import { showToast } from '../../AdminDashBoard/Components/ToastNotification';
const NotificationBell = () => {
    const Baseurl = import.meta.env.VITE_BASEURL;
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const modalRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Fetch notifications from the server
    const localrole = localStorage.getItem('Role')
    const Rolenotif = localrole === 'admin' || localrole === 'staff' ? 'AdminNotif' : 'DentistNotif'

    const formatDate = (date) => {
        const options = {
            month: 'short', // Short month name (e.g., 'Oct')
            day: 'numeric', // Day of the month (e.g., '21')
            hour: '2-digit', // Hour (e.g., '12')
            minute: '2-digit', // Minute (e.g., '30')
            hour12: true, // Use 12-hour clock
        };

        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    };


    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${Baseurl}/Notification/admin/${Rolenotif}`, {
                withCredentials: true,
            });

            if (localrole === 'admin') {
                const adminNotifications = response.data.filter(notification => notification.adminOnly === true);
                setNotifications(adminNotifications.reverse());
                const unreadNotifications = adminNotifications.filter(notification => !notification.adminisRead);
                setUnreadCount(unreadNotifications.length);
            } else if (localrole === 'dentist') {
                const dentistNotifications = response.data
                setNotifications(dentistNotifications.reverse());
                const unreadNotifications = dentistNotifications.filter(notification => !notification.DentistRead);
                setUnreadCount(unreadNotifications.length);
            } else if (localrole === 'staff') {
                const adminNotifications = response.data.filter(notification => notification.adminOnly === true);
                setNotifications(adminNotifications.reverse());
                const unreadNotifications = adminNotifications.filter(notification => !notification.staffisRead);
                setUnreadCount(unreadNotifications.length);
            }


        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        Socket.on('new-admin-notification', NOTIFaddNotificationToUI);
        Socket.on('new-admin-notification-cancel', RED_addNotificationToUI);
        Socket.on('disconnect', () => console.log('Disconnected from server'));

        return () => {
            Socket.off('new-admin-notification', NOTIFaddNotificationToUI);
            Socket.off('new-admin-notification-cancel', RED_addNotificationToUI);
            Socket.off('disconnect', () => console.log('Disconnected from server'));
        };
    }, []);

    const NOTIFaddNotificationToUI = (notification) => {
        showToast('success', 'New Appointment sent');
        add_to_current_notif(notification);
    };

    const RED_addNotificationToUI = (notification) => {
        showToast('error', 'New Notification');
        add_to_current_notif(notification);
    };

    const add_to_current_notif = (notification) => {
        setNotifications((prevNotifications) => {
            const updatedNotifications = [notification, ...prevNotifications];
            const unreadNotifications = updatedNotifications.filter(notif => !notif.adminisRead);
            setUnreadCount(unreadNotifications.length);
            return updatedNotifications;
        });
    };


    const toggleDropdown = () => {
        fetchNotifications();
        setIsOpen(!isOpen);
    };



    const handleNotificationClick = async (notification) => {

        if (localrole === 'dentist') {
            // navigate(`appointment/${notification._id}`)
            await markAsRead(notification._id);
            const appointmentId = notification.appointmentStatus[0].appointment_id;
            navigate(`appointment/${appointmentId}`)
        } else {
            if (!notification.adminisRead) {
                await markAsRead(notification._id);
            }
            const appointmentId = notification.appointmentStatus[0].appointment_id;
            // console.log(appointmentId);
            // navigate(`appointment/${appointmentId}`)

            setSelectedNotification(notification);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => setIsModalOpen(false);


    const markAsRead = async (notifId) => {
        const RoleMARK =
            localrole === 'admin' ? 'adminmarkas' :
                localrole === 'dentist' ? 'dentistmarkas' :
                    'staffmarkas';
        // console.log('RoleMARK', RoleMARK)
        try {
            await axios.put(`${Baseurl}/Notification/admin/${RoleMARK}`, {
                notifid: notifId,
                mark_as: true,
            }, {
                withCredentials: true,
            });
            fetchNotifications();
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
            {localStorage.getItem('Role') == 'admin' && (
                <Settings />
            )}

            <button className="btn btn-ghost btn-circle relative" onClick={toggleDropdown}>
                <div className="indicator" title="notification">
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
                    <span className="badge badge-xs indicator-item" style={{ backgroundColor: '#3FA8BF' }}>
                        {unreadCount}
                    </span>
                </div>
            </button>


            {isOpen && (
                <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-96 bg-neutral shadow-lg rounded-lg z-10 overflow-hidden">
                    <div className="p-3 text-lg border-b border-gray-200 flex justify-between">
                        <div>Notifications</div>
                        <button onClick={() => {
                            navigate('/Annoucement_Notification');
                            toggleDropdown();
                        }}>
                            view all
                        </button>
                    </div>
                    <div className="max-h-96  overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">No new notifications</div>
                        ) : (
                            <ul className="p-2 pr-0 pt-0">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification._id}
                                        className={`my-1 p-3 pl-4 border-b border-gray-200 cursor-pointer text-black hover:bg-gray-100 
                                            ${localrole === 'admin'
                                                ? (!notification.adminisRead
                                                    ? 'bg-[#3FA8BF] font-medium bg-opacity-50'
                                                    : 'bg-[#3FA8BF] bg-opacity-15')
                                                : localrole === 'staff'
                                                    ? (!notification.staffisRead
                                                        ? 'bg-[#3FA8BF] font-medium bg-opacity-50'
                                                        : 'bg-[#3FA8BF] bg-opacity-15')
                                                    : localrole === 'dentist' && !notification.DentistRead
                                                        ? 'bg-[#3FA8BF] font-medium bg-opacity-50'
                                                        : 'bg-[#3FA8BF] bg-opacity-15'
                                            }

`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >

                                        <div className="flex items-center space-x-4">
                                            <span
                                                className="material-symbols-outlined text-black"
                                                style={{
                                                    fontVariationSettings: `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`
                                                }}
                                            >
                                                {notification.ismedicalrequest ? 'picture_as_pdf' : 'notifications'}
                                            </span>

                                            <div className="flex flex-col space-y-1">
                                                {/* <p className="text-sm">
                                                    {notification.title ? "New appointment set" : (notification.user_Appointment_Title || notification.user_Appointment_message || "")}
                                                </p> */}

                                                <p className="text-sm">
                                                    {localrole === 'admin' || localrole === 'staff'
                                                        ? (notification.user_Appointment_Title || notification.user_Appointment_message || "")
                                                        : (localrole === 'dentist'
                                                            ? (notification.title ? "New appointment set" : (notification.user_Appointment_Title || notification.user_Appointment_message || ""))
                                                            : "")
                                                    }

                                                </p>

                                                <p>
                                                    {notification.patientStatus[0]?.patient
                                                        ? `${notification.patientStatus[0].patient.LastName}, ${notification.patientStatus[0].patient.FirstName} ${notification.patientStatus[0].patient.MiddleName || ''}`
                                                        : 'Patient information unavailable'}
                                                </p>
                                                {/* Uncomment if needed: */}
                                                <p className="text-xs text-gray-500">
                                                    created at: {formatDate(notification.createdAt)}
                                                </p> 
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
                        <div className=''>
                            <h1 className='text-center text-2xl font-bold text-[#032742]'>Notification</h1>
                            <div className="p-4">
                                <h2 className="text-xl font-bold">{selectedNotification.user_Appointment_Title}</h2>
                                <p>{selectedNotification.user_Appointment_message}</p>
                                <div className='flex justify-evenly'>
                                    <button className="bg-[#D9D9D9] hover:bg-[#ADAAAA] btn mt-4" onClick={closeModal}>
                                        Close
                                    </button>
                                    <button className="bg-[#2bbcff] hover:bg-[#74b4e5] btn mt-4" onClick={() => {
                                        closeModal();
                                        // navigate(`appointment/${selectedNotification.appointmentStatus[0].appointment_id}`);
                                        if (selectedNotification.user_Appointment_Title === 'Dental Certificate Request') {
                                            navigate(`Medical_requests`);
                                        } else {
                                            navigate(`appointment/${selectedNotification.appointmentStatus[0].appointment_id}`);
                                        }
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
