import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
// import './react-big-calendar.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../Components/Modal';
import EventModal from './Components/EventModal';
import eventStyleGetter from './Components/eventStyleGetter';
import dayPropGetter from './Components/dayPropGetter';
import Legend from './Components/Legend';
import CalendarView from './Components/CalendarView';
import CustomCalendar from './Components/CustomCalendar';
import DentistSelector from './Selector/DentistSelector';
import PatientSelector from './Selector/PatientSelector';
import ProceduresSelector from './Selector/ProceduresSelector';


import './react-big-calendar.css'
import AvailableTimeSlots from './Components/AvailableTimeSlots';
import ConfirmAppointmentModal from './Components/ConfirmAppointmentModal ';
import { showToast } from '../../Components/ToastNotification';
import { m } from 'framer-motion';
import Swal from 'sweetalert2';

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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [date, setDate] = useState(new Date());
    // const [date, setDate] = useState(new Date(new Date().getFullYear(), 11, 1)); // December 1st of the current year

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [selectedDentist, setSelectedDentist] = useState(null);
    const [selectedPatient, setselectedPatient] = useState(null);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [procedures, setProcedures] = useState([]);
    const [allButtonsDisabled, setAllButtonsDisabled] = useState(false);

    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSubmited, setisSubmited] = useState(false);
    const [SelectedProcedureDuration, setSelectedProcedureDuration] = useState();
    const [isPast, setIsPast] = useState(false);

    const [missingPatient, setMissingPatient] = useState(false);
    const [missingDentist, setMissingDentist] = useState(false);
    const [missingProcedures, setMissingProcedures] = useState(false);




    useEffect(() => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        setIsPast(selectedDate < currentDate);
    }, [selectedDate]);


    const handleSelectDentist = (selecteddentistData) => {
        if (selecteddentistData) {
            setSelectedDentist(selecteddentistData);

            const unavailableEvents = selecteddentistData.NotAvailable_on.map((unavailable) => ({
                id: unavailable._id,
                title: 'Dentist Not Available',
                start: new Date(unavailable.from),
                end: new Date(unavailable.to),
                allDay: true,
                notes: `Unavailable from ${new Date(unavailable.from).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })} to ${new Date(unavailable.to).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}`,
                status: 'Dentist Not Available',
            }));

            setEvents((prevEvents) => {
                const filteredEvents = prevEvents.filter(event => event.status !== 'Dentist Not Available');

                return [...filteredEvents, ...unavailableEvents];
            });
        } else {
            setEvents((prevEvents) => {
                const filteredEvents = prevEvents.filter(event => event.status !== 'Dentist Not Available');
                return [...filteredEvents];
            });
        }

    };


    const handleSelectPatient = (selectedPatient) => {
        if (selectedPatient) {
            console.log('selectedPatient', selectedPatient)
            setselectedPatient(selectedPatient)
        } else {
            setselectedPatient('')
        }

    };
    const handleSelectProcedures = (Procedures) => {
        // setSelectedProcedureDuration

        if (Procedures) {
            const totalDuration = procedures.reduce((sum, procedure) => sum + parseInt(procedure.Duration), 0);

            // console.log('selectedProcedures', Procedures)
            setSelectedProcedureDuration(totalDuration)
            setProcedures(Procedures)

        } else {
            setselectedPatient('')
        }

    };

    const fetchUnavailableDates = async () => {
        try {
            const response = await axios.get(`${Baseurl}/clinicClose/unavailable`);
            const unavailableData = response.data;

            const unavailableEvents = unavailableData[0].NotAvailable_on.map((unavailable) => {
                const startDate = new Date(unavailable.from);
                const endDate = new Date(unavailable.to);

                // FOR WHOLEDAY
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);


                return {
                    id: unavailable._id,
                    title: 'Clinic Closed',
                    start: startDate,
                    end: endDate,
                    allDay: true,
                    notes: `Unavailable from ${startDate.toLocaleDateString('en-US')} to ${endDate.toLocaleDateString('en-US')}`,
                    status: 'Clinic Closed',
                };
            });


            setUnavailableDates(unavailableEvents);
            return unavailableEvents;
        } catch (error) {
            console.error('Error fetching unavailable dates:', error);
            return [];
        }
    };


    const fetchAppointments = async () => {
        // console.log('fetchAppointments start')
        try {
            const response = await axios.get(`${Baseurl}/Appointments/appointments/filter`);
            const appointmentsData = response.data;

            const filteredAppointments = appointmentsData.filter(
                (data) => data.status === 'Completed' || data.status === 'Approved' || data.status === 'Pending'
            );

            const mappedEvents = filteredAppointments.map((appointment) => {
                const dentistName = appointment.Dentist
                    ? `${appointment.Dentist.FirstName} ${appointment.Dentist.LastName}`
                    : 'No dentist assigned';

                return {
                    id: appointment.id,
                    title: `${appointment.patient.FirstName} ${appointment.patient.LastName}`,
                    start: new Date(appointment.start),
                    end: new Date(appointment.end),
                    allDay: false,
                    notes: appointment.notes,
                    status: appointment.status,
                    dentist: dentistName
                };
            });

            return mappedEvents;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
    };

    const fetchEvents = async () => {
        const unavailableDates = await fetchUnavailableDates();
        const fetchedAppointments = await fetchAppointments();
        setAppointments(fetchedAppointments);
        // console.log('setAppointments', fetchedAppointments)
        setEvents([...fetchedAppointments, ...unavailableDates]);
        setLoading(false);
    };
    useEffect(() => {


        fetchEvents();
    }, []);

    const handleDateChange = (newDate) => {
        setDate(newDate);
    };
    const handleSelectSlot = (slotInfo) => {
        handleDateChange(slotInfo.start);
        setSelectedDate(slotInfo.start);
        // console.log('slotInfo START', slotInfo.start);

        const selectedDate = slotInfo.start.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
        // console.log('selectedDate', selectedDate);

        const isDentistUnavailable = events.some((event) => {
            const eventStartDate = event.start.toLocaleDateString('en-CA');
            const eventEndDate = event.end.toLocaleDateString('en-CA');

            return (
                event.status === 'Dentist Not Available' &&
                selectedDate <= eventStartDate &&
                selectedDate >= eventEndDate
            );
        });
        setAllButtonsDisabled(isDentistUnavailable);
        // console.log('isDentistUnavailable', isDentistUnavailable);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
    };

    useEffect(() => {
        const fetchEvents = async () => {
            const unavailableDates = await fetchUnavailableDates();
            const fetchedAppointments = await fetchAppointments();
            setAppointments(fetchedAppointments);
            setEvents([...fetchedAppointments, ...unavailableDates]);
            setLoading(false);

            // const isClosed = unavailableDates.some(unavailable =>
            //     date >= new Date(unavailable.start) && date <= new Date(unavailable.end)
            // );
            // setAllButtonsDisabled(isClosed);

        };

        fetchEvents();
    }, []);

    const handleSelectTimeSlot = (slot, date) => {
        setSelectedTimeSlot(slot);

        // Calculate the end time of the selected appointment based on procedure duration
        const selectedStartTime = new Date(slot);
        const selectedEndTime = new Date(selectedStartTime);
        selectedEndTime.setMinutes(selectedStartTime.getMinutes() + SelectedProcedureDuration); // Add duration

        let overlaptime = []

        // Check for overlapping appointments
        const overlappingAppointment = appointments.some(appointment => {
            const appointmentStartTime = new Date(appointment.start);
            const appointmentEndTime = new Date(appointment.end);

            // Check if the selected time slot overlaps with any existing appointment
            const isOverlap = selectedStartTime < appointmentEndTime && selectedEndTime > appointmentStartTime;

            // Log the overlapping appointment if there's a match
            if (isOverlap) {
                // console.log('Overlapping Appointment:', {
                //     selectedStartTime,
                //     selectedEndTime,
                //     appointmentStartTime,
                //     appointmentEndTime,
                //     appointment // Optionally log the full appointment object
                // });
            }
            overlaptime.push({
                selectedStartTime,
                selectedEndTime,
                appointmentStartTime,
                appointmentEndTime,
                appointment
            });


            return isOverlap;
        });

        if (overlappingAppointment) {

            // Alert user that the selected time slot overlaps with an existing appointment
            showToast('error', 'The selected time slot overlaps with an existing appointment.');
            return;
        }

        console.log('overlaptime', overlaptime)
        // Define state for missing fields


        // Array to store missing fields
        const missingFields = [];

        if (!selectedPatient) {
            missingFields.push('Patient');
            setMissingPatient(true); // Set to true if patient is missing
        }

        if (!selectedDentist) {
            missingFields.push('Dentist');
            setMissingDentist(true); // Set to true if dentist is missing
        }

        if (!procedures.length) {
            missingFields.push('Procedures');
            setMissingProcedures(true); // Set to true if procedures are missing
        }

        // Optionally, you can display a message with missing fields
        if (missingFields.length > 0) {
            const errorMessage = `Missing fields: ${missingFields.join(', ')}`;
            // showToast('error', errorMessage);
        }


        if (!selectedDate) {
            missingFields.push('Date');
        }

        if (!slot) {
            missingFields.push('Time Slot');
        }

        // If there are missing fields, show a specific alert
        if (missingFields.length) {
            const errormessage = `Please ensure the following fields are selected: ${missingFields.join(', ')}`;
            Swal.fire({
                title: "Please Complete",
                text: errormessage,
                icon: "error"
            });


            // showToast('error', errormessage);
        } else {
            setConfirmModalOpen(true);
        }
    };

    const showLoading = () => {
        Swal.fire({
            title: 'Loading...',
            text: 'Please wait while we process your request.',
            icon: 'info',
            allowOutsideClick: false, // Prevent closing the alert
            didOpen: () => {
                Swal.showLoading(); // Show loading spinner
            }
        });
    };

    // Hide loading and show success/error
    const hideLoading = (isSuccess) => {
        // Close the loading SweetAlert
        Swal.close();

        // Show success or error based on isSuccess
        Swal.fire({
            title: isSuccess ? 'Success!' : 'Error!',
            text: isSuccess ? 'Appointment successfully added.' : 'Something went wrong.',
            icon: isSuccess ? 'success' : 'error',
            confirmButtonText: 'OK'
        });
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmAppointment = async (notes) => {
        if (!selectedPatient || !selectedDentist || !procedures.length || !selectedDate || !selectedTimeSlot) {
            const errormessage = `Please ensure all fields are selected`;
            // showToast('error', errormessage);
            return;
        }

        showLoading(); // Show loading SweetAlert
        setIsLoading(true); // Set loading state to true

        const localDate = new Date(selectedDate);
        const selectedTime = new Date(selectedTimeSlot);
        localDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        const totalDuration = procedures.reduce((sum, procedure) => sum + parseInt(procedure.Duration), 0);

        const endDate = new Date(localDate);
        endDate.setMinutes(endDate.getMinutes() + totalDuration);

        const appointmentData = {
            notes: notes,
            procedureIds: procedures.map(p => p._id),
            date: localDate.toISOString().split('T')[0],
            Start: localDate.toISOString(),
            End: endDate.toISOString(),
            DentistID: selectedDentist._id,
            Amount: 100,
            status: "Approved",
        };

        try {
            setConfirmModalOpen(false);
            const response = await axios.post(`${Baseurl}/Appointments/add/history/${selectedPatient._id}`, appointmentData, { withCredentials: true });

            setisSubmited(true);

            setTimeout(() => fetchEvents(), 200);

            setIsLoading(false);
            hideLoading(true);
        } catch (error) {
            setIsLoading(false);
            hideLoading(false);
            setConfirmModalOpen(true);

            console.error('Error adding appointment to history:', error);
        }

        setTimeout(() => setisSubmited(false), 1000);
    };



    return (
        <div className="p-4 mx-auto">
            <h1 className="text-[#3EB489] text-4xl font-bold">Create Appointment</h1>

            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className="  items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">



                        <PatientSelector
                            onSelectPatient={handleSelectPatient}
                            isSubmited={isSubmited}
                            missingPatient={missingPatient}
                            setMissingPatient={setMissingPatient}
                        />
                        <div>
                            <DentistSelector
                                onSelectDentist={handleSelectDentist}
                                isSubmited={isSubmited}
                                missingDentist={missingDentist}
                                setMissingDentist={setMissingDentist}
                            />
                            <ProceduresSelector
                                onselectprocedures={handleSelectProcedures}
                                isSubmited={isSubmited}
                                missingProcedures={missingProcedures}
                                setMissingProcedures={setMissingProcedures}
                            />
                        </div>
                    </div>
                    {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> {/* Set to 2 columns on large screens */}

                        {/* Calendar section */}
                        {/* <div className="lg:col-span-2 border border-green-500 rounded-md flex flex-col justify-between min-h-[500px]"> */}
                        <div className="border border-green-500 rounded-md flex flex-col justify-between min-h-[500px]">
                            <div>
                                <CalendarView
                                    events={events}
                                    view={view}
                                    date={date}
                                    handleDateChange={handleDateChange}
                                    handleViewChange={setView}
                                    handleSelectSlot={handleSelectSlot}
                                    handleSelectEvent={handleSelectEvent}
                                    eventStyleGetter={eventStyleGetter}
                                    dayPropGetter={(date) => dayPropGetter(date, events)}
                                />
                                <Legend />
                            </div>

                        </div>
                        {/* Time slots section */}
                        {/* <div className="border border-green-500 rounded-md flex justify-center min-h-[500px] w-full"> */}
                        <div className="border border-green-500 rounded-md flex justify-center min-h-[500px] w-full">

                            <AvailableTimeSlots
                                selectedDate={date}
                                unavailableDates={unavailableDates}
                                appointments={appointments}
                                onSelectTimeSlot={handleSelectTimeSlot}
                                // isDisabled={availableSlotsDisabled}
                                allButtonsDisabled={allButtonsDisabled}
                                isPast={isPast}
                                SelectedProcedureDuration={SelectedProcedureDuration}

                            />
                        </div>
                    </div>

                </div>
            )}
            {modalOpen && selectedEvent && (
                <EventModal isOpen={modalOpen} event={selectedEvent} closeModal={closeModal} />
            )}
            {confirmModalOpen && (
                <ConfirmAppointmentModal
                    isOpen={confirmModalOpen}
                    patient={selectedPatient}
                    dentist={selectedDentist}
                    procedures={procedures}
                    date={selectedDate}
                    timeSlot={selectedTimeSlot}
                    onConfirm={handleConfirmAppointment}
                    onCancel={() => setConfirmModalOpen(false)}
                />
            )}
        </div>

    );
};

export default CalendarComponent;
