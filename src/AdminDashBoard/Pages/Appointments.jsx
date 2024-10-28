import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import { axisClasses } from '@mui/x-charts';
import { showToast } from '../Components/ToastNotification';
import Socket from '../../Utils/Socket';

export default function Appointments() {
    const BASEURL = import.meta.env.VITE_BASEURL;

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(['Pending', 'Approved']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewType, setViewType] = useState('current');
    const [timeView, setTimeView] = useState('filter'); // New state to track day, week, month view
    const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date
    const [selectedWeek, setSelectedWeek] = useState(new Date()); // State for selected week
    const [selectedMonth, setSelectedMonth] = useState(new Date()); // State for selected month
    const [loadingApprove, setLoadingApprove] = useState({});
    const [loadingReject, setLoadingReject] = useState({});

    const today = () => {
        setViewType('current')
        filterAppointments(appointments);
    }

    const day = () => {
        setTimeView('day')
        setSelectedDate(new Date())
        setSelectedWeek(new Date())
        setSelectedMonth(new Date())
        filterAppointments(appointments);
    }

    const getAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASEURL}/Appointments/appointments/filter`, {
                withCredentials: true
            });

            if (response.status === 200) {
                setAppointments(response.data);
                filterAppointments(response.data); // Filter appointments based on the view type
            }
        } catch (error) {
            setError('Error fetching appointments. Please try again.');
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {


        getAppointments();
    }, [BASEURL]);


    useEffect(() => {

        const Socketeventname = 'new-appointment-set'
        Socket.on(Socketeventname, addNewAppointmentToUI);
        Socket.on('disconnect', () => console.log('Disconnected from server'));

        // Clean up socket event listeners on unmount
        return () => {
            Socket.off(Socketeventname, addNewAppointmentToUI);
        };
    }, [BASEURL]);

    const addNewAppointmentToUI = (newAppointment) => {
        setAppointments((prevAppointments) => {
            const updatedAppointments = [newAppointment, ...prevAppointments];
            filterAppointments(updatedAppointments);
            return updatedAppointments;
        });
    };


    const filterAppointments = (appointments) => {
        let filtered = [];

        // Filter appointments based on the view type
        if (viewType === 'current') {
            filtered = appointments.filter(app => new Date(app.start) >= new Date());
        } else {
            filtered = appointments;
        }

        // Sort filtered appointments by start date
        filtered.sort((a, b) => new Date(a.start) - new Date(b.start));

        // Apply time period filter
        filtered = filterByTimePeriod(filtered);

        // Filter by status
        const statusFiltered = filtered.filter(app =>
            selectedStatus.length === 0 || selectedStatus.includes(app.status)
        );

        // Update the state with the filtered appointments
        setFilteredAppointments(statusFiltered);
    };


    const toggleStatus = (status) => {
        setSelectedStatus((prevSelected) => {
            if (prevSelected.includes(status)) {
                return prevSelected.filter(item => item !== status); // Remove status if already selected
            } else {
                return [...prevSelected, status]; // Add status if not selected
            }
        });
    };


    const filterByTimePeriod = (appointments) => {
        let filtered = [];
        if (timeView === 'day') {
            const selectedDayStart = new Date(selectedDate);
            selectedDayStart.setHours(0, 0, 0, 0); // Set to start of the day

            const selectedDayEnd = new Date(selectedDate);
            selectedDayEnd.setHours(23, 59, 59, 999); // Set to end of the day

            filtered = appointments.filter(app => {
                const appDate = new Date(app.start);
                return appDate >= selectedDayStart && appDate <= selectedDayEnd;
            });
        } else if (timeView === 'week') {
            const startOfWeek = new Date(selectedWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay()));
            const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
            filtered = appointments.filter(app => {
                const appDate = new Date(app.start);
                return appDate >= startOfWeek && appDate <= endOfWeek;
            });
        } else if (timeView === 'month') {
            const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
            const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
            filtered = appointments.filter(app => {
                const appDate = new Date(app.start);
                return appDate >= startOfMonth && appDate <= endOfMonth;
            });
        } else {
            filtered = appointments;
        }

        return filtered;
    };

    useEffect(() => {
        filterAppointments(appointments);
    }, [selectedStatus, appointments, viewType, timeView, selectedDate, selectedWeek, selectedMonth]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg text-red-500">{error}</div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Rejected':
            case 'Missed':
                return 'text-red-500';
            case 'Completed':
            case 'Pending':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    };
    const disabledStatuses = ["Approved", "Rejected", "Missed", "Completed", "Cancelled"];

    const getRelativeTime = (date) => {
        const now = new Date();
        const diffInTime = now - date;
        const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return { text: "Today", color: "text-green-500" };
        } else if (diffInDays === 1) {
            return { text: "Yesterday", color: "text-gray-500" };
        } else if (diffInDays > 1) {
            return { text: `${diffInDays} days ago`, color: "text-gray-500" };
        } else {
            return { text: "Incoming", color: "text-blue-500" };
        }
    };


    const updateAppointmentStatus = async (app_id, newStatus) => {
        try {
            if (newStatus === 'Approved') {
                setLoadingApprove(prev => ({ ...prev, [app_id]: true }));
            } else if (newStatus === 'Rejected') {
                setLoadingReject(prev => ({ ...prev, [app_id]: true }));
            }

            const response = await axios.put(
                `${BASEURL}/Appointments/admin/appointmentUpdate/${app_id}`,
                { newStatus: newStatus },
                { withCredentials: true }
            );

            if (response.status === 200) {
                showToast('success', `Appointment: ${newStatus} `);

                console.log("Appointment status updated successfully");

                setAppointments(prevAppointments => {
                    return prevAppointments.map(app =>
                        app.id === app_id ? { ...app, status: newStatus } : app
                    );
                });
            }
        } catch (error) {
            console.error("Error updating appointment status:", error);
        } finally {
            if (newStatus === 'Approved') {
                setLoadingApprove(prev => ({ ...prev, [app_id]: false }));
            } else if (newStatus === 'Rejected') {
                setLoadingReject(prev => ({ ...prev, [app_id]: false }));
            }
        }
    };


    const handleSelectChange = (event) => {
        const value = event.target.value;
        if (value === 'day') {
            day();
        } else {
            setTimeView(value);
        }
    };

    const getBackgroundColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-200 bg-opacity-50';
            case 'Approved':
                return 'bg-blue-200 bg-opacity-50';
            case 'Completed':
                return 'bg-green-200 bg-opacity-50';
            case 'Missed':
                return 'bg-red-200 bg-opacity-50';
            case 'Rejected':
                return 'bg-red-100 bg-opacity-50';
            case 'Cancelled':
                return 'bg-gray-300 bg-opacity-50';
            default:
                return 'bg-gray-200 bg-opacity-50';
        }
    };

    const getIconColor = (status) => {
        switch (status) {
            case 'Pending':
                return '#FFC107';
            case 'Approved':
                return '#007BFF';
            case 'Completed':
                return '#28A745';
            case 'Missed':
                return '#DC3545';
            case 'Rejected':
                return '#C82333';
            case 'Cancelled':
                return '#6C757D';
            default:
                return 'inherit';
        }
    };


    return (

        <div className=''>
            <h1 className="text-3xl font-bold mb-4">Appointment Requests</h1>
            <div className="text-gray-600 mb-8">{formattedDate}</div>


            <div className="rounded mb-4 text-white">
                <div className="flex justify-between items-center">
                    {/* Left Side Buttons */}
                    <div className="flex">
                        <button
                            onClick={() => setViewType('current')}
                            className={`p-2 ${viewType === 'current' ? 'rounded mr-2 bg-[#62A78E] text-white' : 'bg-[#3EB489]'}`}
                        >
                            Current & Upcoming
                        </button>
                        <button
                            onClick={() => {
                                setViewType('all');
                                setTimeView('');
                            }}
                            className={`p-2 ${viewType === 'all' ? 'ml-2 rounded bg-[#62A78E] text-white' : 'bg-[#3EB489]'}`}
                        >
                            All Appointments
                        </button>
                    </div>


                    <div className="flex items-center w-full max-w-sm">
                        <span className=' text-black mr-2'>Select Frequency: </span><select
                            value={timeView}
                            onChange={handleSelectChange}
                            className="p-2 border rounded bg-gray-100 text-black  mb-2 flex-1"
                        >

                            <option value="filter" className=" text-black">
                                --Select Frequency--
                            </option>
                            <option value="day" className=" text-black">
                                Day
                            </option>
                            <option value="week" className=" text-black">
                                Week
                            </option>
                            <option value="month" className="text-black">
                                Month
                            </option>

                        </select>

                    </div>
                </div>
            </div>


            {/* Time View Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pb-2">
                {['Pending', 'Approved', 'Completed', 'Missed', 'Rejected', 'Cancelled'].map(status => (
                    <div
                        key={status}
                        className={`flex items-center cursor-pointer p-2 rounded-md ${getBackgroundColor(status)} hover:bg-opacity-75 transition duration-200`}
                        onClick={() => toggleStatus(status)}
                    >
                        <span
                            className="material-symbols-outlined text-2xl"
                            style={{ color: getIconColor(status) }}
                        >
                            {selectedStatus.includes(status) ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <p className="text-gray-700 font-medium ml-2">{status}</p>
                    </div>
                ))}
            </div>


            <div className='grid grid-cols-2 gap-4'>
                {/* Appointment List */}




                {/* Date Picker Section */}
                <div className="ml-auto mb-8 flex items-center">
                    {/* Show label and picker based on timeView */}
                    {timeView === 'month' && (
                        <>
                            <p className="mb-0 mr-2">Select Month:</p>
                            <DatePicker
                                selected={selectedMonth}
                                onChange={(date) => setSelectedMonth(date)}
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                className="p-2 border rounded"
                            />
                        </>
                    )}

                    {timeView === 'day' && (
                        <>
                            <p className="mb-0 mr-2">Select Day:</p>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="MMMM d, yyyy"
                                className="p-2 border rounded"
                                filterDate={date => {
                                    const day = new Date();
                                    return (viewType !== 'current' && viewType !== 'upcoming') || date >= day;
                                }}
                            />
                        </>
                    )}

                    {/* Week Picker */}
                    {timeView === 'week' && (
                        <div className="mb-4">
                            <button onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() - 7)))} className="p-2 bg-[#3EB489] hover:bg-[#62A78E] text-white">
                                Prev Week
                            </button>
                            <span className="p-2">
                                {new Date(selectedWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay())).toDateString()} - {new Date(selectedWeek.setDate(selectedWeek.getDate() + 6)).toDateString()}
                            </span>
                            <button onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() + 7)))} className="p-2 bg-[#3EB489] hover:bg-[#62A78E] text-white">
                                Next Week
                            </button>
                        </div>
                    )}
                </div>
            </div>


            <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center">
                                {selectedStatus.map((status) => (
                                <h1 key={status}>No {status} appointments</h1>
                            ))}
                        </div>
                        ) : (
                        <div className="overflow-auto max-h-screen">
                            {filteredAppointments.map(appointment => {
                                const appointmentDateTime = new Date(appointment.start);
                                const appointmentEndTime = new Date(appointment.end);

                                if (isNaN(appointmentDateTime.getTime()) || isNaN(appointmentEndTime.getTime())) {
                                    return <span key={appointment.id} className="text-red-500">Invalid Date</span>;
                                }

                                const { text: relativeTime, color: relativeColor } = getRelativeTime(appointmentDateTime);
                                const isApproveDisabled = disabledStatuses.includes(appointment.status) || appointmentDateTime < currentDate;
                                const isDeclineDisabled = appointment.status !== "Pending" || appointmentDateTime < currentDate;

                                return (
                                    <div key={appointment.id} className="p-4 my-1 bg-gray-100 rounded flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">
                                                {appointmentDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} -
                                                {appointmentEndTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })},
                                                {appointmentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>

                                            <div className="text-gray-600">
                                                {appointment.patient.FirstName} {appointment.patient.LastName}
                                            </div>

                                            <div>
                                                {appointment.procedures.length > 0
                                                    ? appointment.procedures[0].name
                                                    : 'No procedure listed'}
                                            </div>
                                            <div className="text-gray-600">
                                                <p>
                                                    <strong>Status: </strong>
                                                    <span className={getStatusColor(appointment.status)}>
                                                        {appointment.status}
                                                    </span>
                                                </p>
                                                <p className={`text-sm ${relativeColor}`}>
                                                    {relativeTime}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2 items-center">
                                            <button
                                                onClick={() => updateAppointmentStatus(appointment.id, 'Approved')}
                                                disabled={isApproveDisabled || loadingApprove[appointment.id]} // Disable when approving
                                                className={`p-2 px-3 rounded-2xl ${isApproveDisabled || loadingApprove[appointment.id] ? "bg-gray-400 cursor-not-allowed" : "flex flex-col items-center justify-center bg-green-200 text-green-700 hover:text-green-900 transition rounded-lg shadow-sm"}`}
                                                title='approve'
                                            >
                                                {loadingApprove[appointment.id] ? (
                                                    <span className="loading loading-spinner"></span> // Show spinner when approving
                                                ) : (
                                                    <span className="material-symbols-outlined text-green text-2xl">check_box</span>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => updateAppointmentStatus(appointment.id, 'Rejected')}
                                                disabled={isDeclineDisabled || loadingReject[appointment.id]} // Disable when rejecting
                                                className={`p-2 px-3 rounded-2xl ${isDeclineDisabled || loadingReject[appointment.id] ? "bg-gray-400 cursor-not-allowed" : "flex flex-col items-center justify-center bg-red-200 text-red-700 hover:text-red-900 transition rounded-lg shadow-sm"}`}
                                                title='cancel'
                                            >
                                                {loadingReject[appointment.id] ? (
                                                    <span className="loading loading-spinner"></span> // Show spinner when rejecting
                                                ) : (
                                                    <span className="material-symbols-outlined text-red text-2xl">cancel</span>
                                                )}
                                            </button>


                                            <Link to={`/appointment/${appointment.id}`} className="flex flex-col  items-center p-2 px-3  justify-center bg-blue-200 text-blue-700 hover:text-blue-900 transition rounded-lg shadow-sm"
                                                title='view'>
                                                <span className="material-symbols-outlined text-2xl">
                                                    visibility
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                )}
                    </div>
        </div>
            );
}
