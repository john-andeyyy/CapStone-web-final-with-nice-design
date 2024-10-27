import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Modal from '../AdminDashBoard/Components/Modal';
import Socket from '../Utils/Socket';

const Baseurl = import.meta.env.VITE_BASEURL;

const locales = {
    'en-US': enUS,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const formatEventDate = (start, end) => {
    const options = {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    const formattedStartDate = start.toLocaleString('en-US', options);
    const formattedEndDate = end.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    return `${formattedStartDate} to ${formattedEndDate}`;
};

const CalendarComponent = () => {
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilters, setStatusFilters] = useState({
        Pending: false,
        Rejected: false,
        Approved: true,
        Completed: false,
        Missed: false,
        Cancelled: false,
    });

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${Baseurl}/Appointments/appointments/filter`);
            const appointmentsData = response.data;
            const filteredAppointments = appointmentsData.filter(data =>
                statusFilters[data.status] // Use statusFilters to filter events
            );

            const mappedEvents = filteredAppointments.map((appointment) => {
                const startUTC = new Date(appointment.start);
                const endUTC = new Date(appointment.end);

                return {
                    id: appointment.id,
                    title: `${appointment.patient.FirstName} ${appointment.patient.LastName}`,
                    start: startUTC,
                    end: endUTC,
                    allDay: false,
                    notes: appointment.notes,
                    status: appointment.status,
                };
            });

            setEvents(mappedEvents);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [statusFilters]);


    
    useEffect(() => {
        const Socketeventname = 'new-appointment-set';

        const handleNewAppointment = (newAppointment) => {
            const startUTC = new Date(newAppointment.start);
            const endUTC = new Date(newAppointment.end);

            const formattedAppointment = {
                id: newAppointment.id,
                title: `${newAppointment.patient.FirstName} ${newAppointment.patient.LastName}`,
                start: startUTC,
                end: endUTC,
                allDay: false,
                notes: newAppointment.notes,
                status: newAppointment.status,
            };

            setEvents((prevAppointments) => {
                const updatedEvents = [formattedAppointment, ...prevAppointments];

                return updatedEvents.filter(event => statusFilters[event.status]);
            });
        };

        Socket.on(Socketeventname, handleNewAppointment);
        Socket.on('disconnect', () => console.log('Disconnected from server'));

        return () => {
            Socket.off(Socketeventname, handleNewAppointment);
        };
    }, [statusFilters]);





    const handleDateChange = (newDate) => {
        setDate(newDate);
    };

    const handleSelectSlot = (slotInfo) => {
        handleDateChange(slotInfo.start);
        setView('day');
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
    };

    const CustomDayCell = ({ date, children, ...props }) => {
        const isToday = date.toDateString() === new Date().toDateString();
        return (
            <div {...props} className={`p-2 ${isToday ? 'bg-red-600 text-white' : 'bg-transparent text-gray-800'}`}>
                {children}
            </div>
        );
    };
    const getBackgroundColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-200 bg-opacity-50'; // Yellow
            case 'Approved':
                return 'bg-blue-200 bg-opacity-50'; // Blue
            case 'Completed':
                return 'bg-green-200 bg-opacity-50'; // Green
            case 'Missed':
                return 'bg-red-200 bg-opacity-50'; // Red
            case 'Rejected':
            case 'Cancelled':
                return 'bg-gray-200 bg-opacity-50'; // Gray
            default:
                return 'bg-gray-200 bg-opacity-50'; // Fallback
        }
    };


    const getIconColor = (status) => {
        switch (status) {
            case 'Pending':
                return '#FFC107'; // Yellow
            case 'Approved':
                return '#007BFF'; // Blue
            case 'Completed':
                return '#28A745'; // Green
            case 'Missed':
                return '#DC3545'; // Red
            case 'Rejected':
            case 'Cancelled':
                return '#6C757D'; // Gray
            default:
                return 'inherit'; // Fallback to inherit if needed
        }
    };

    const eventStyleGetter = (event) => {
        let backgroundColor;

        switch (event.status.toLowerCase()) {
            case 'pending':
                backgroundColor = '#FFC107'; // Warning
                break;
            case 'approved':
                backgroundColor = '#007BFF'; // Primary
                break;
            case 'completed':
                backgroundColor = '#28A745'; // Success
                break;
            case 'missed':
                backgroundColor = '#DC3545'; // Danger
                break;
            case 'cancelled':
                backgroundColor = '#6C757D'; // Secondary
                break;
            case 'rejected':
                backgroundColor = '#6C757D'; // Secondary
                break;
            default:
                backgroundColor = '';
        }

        return {
            style: {
                backgroundColor,
                color: 'white',
                borderRadius: '5px',
                padding: '2px',
                border: 'none',
                fontSize: '10px',
            },
        };
    };

    const toggleStatusFilter = (status) => {
        setStatusFilters((prevFilters) => ({
            ...prevFilters,
            [status]: !prevFilters[status],
        }));
    };

    return (
        <div className="p-4 min-h-screen bg-[#3EB489] bg-opacity-50">
            <h1 className="text-2xl font-semibold mb-4">View Appointments</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pb-2">
                {Object.keys(statusFilters).map((status) => (
                    <div
                        key={status}
                        className={`flex items-center cursor-pointer p-2 rounded-md ${getBackgroundColor(status)} hover:bg-opacity-75 transition duration-200`}
                        onClick={() => toggleStatusFilter(status)}
                    >
                        <span
                            className="material-symbols-outlined text-2xl"
                            style={{ color: getIconColor(status) }}
                        >
                            {statusFilters[status] ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <p className="text-gray-700 font-medium ml-2">{status}</p>
                    </div>
                ))}
            </div>



            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className='bg-white px-2 sm:px-4 md:px-9 py-0'>
                    <div className="w-full">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{
                                height: 'calc(100vh - 200px)', // Adjust height dynamically
                                width: '100%', // Make calendar width 100%
                                backgroundColor: 'bg-base-200',
                                borderRadius: '10px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                margin: '0'
                            }}
                            view={view}
                            date={date}
                            onNavigate={handleDateChange}
                            onView={setView}
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleSelectEvent}
                            selectable
                            views={['month', 'week', 'day', 'agenda']}
                            min={new Date(0, 0, 0, 8, 0, 0)} // 8 AM
                            max={new Date(0, 0, 0, 17, 0, 0)} // 5 PM
                            components={{
                                day: {
                                    date: CustomDayCell,
                                },
                            }}
                            eventPropGetter={eventStyleGetter}
                        />
                    </div>
                </div>
            )}

            {modalOpen && (
                <Modal isOpen={modalOpen}>
                    <div className="p-4 rounded">
                        <h2 className="text-xl font-bold">{selectedEvent?.title}</h2>
                        <p>{formatEventDate(selectedEvent?.start, selectedEvent?.end)}</p>
                        <p>Notes: {selectedEvent?.notes}</p>
                        <p>Status: {selectedEvent?.status}</p>

                        <div className='flex justify-between items-center pt-4'>
                            <div className="flex space-x-2">
                                <Link
                                    to={`/appointment/${selectedEvent.id}`}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    View Details
                                </Link>
                            </div>
                            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>


    );
};

export default CalendarComponent;
