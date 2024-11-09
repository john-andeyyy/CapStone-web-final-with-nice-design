import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import '../Dashboard components/Calendar.css'; 
import Dashboard_Fetch from './Dashboard_Fetch';
import Modal from '../Modal';
import { useNavigate } from 'react-router-dom';

export default function Dashboard_Calendar() {
    const navigate = useNavigate()
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false); 


    const { data, loading, error } = Dashboard_Fetch();
    
    useEffect(() => {
        if (data.Appointment_Approved) {
            const formattedEvents = data.Appointment_Approved.map(appointment => {
                return {
                    title: `${appointment.patient.FirstName} ${appointment.patient.MiddleName} ${appointment.patient.LastName}`,
                    start: new Date(appointment.start),
                    end: new Date(appointment.end),
                    status: appointment.status,
                    id: appointment.id,
                    procedures: appointment.procedures,
                };

            });

            setEvents(formattedEvents);
        }
    }, [data.Appointment_Approved]);


    // Loading and error states
    if (loading) return <div>Loading...</div>;
    if (error) {
        return (
            <div className="p-2 rounded-lg text-center max-w-sm mx-auto bg-neutral shadow-lg">
                <Calendar
                    className="react-calendar rounded-lg shadow-md"
                    onChange={(value) => setDate(value)}
                    value={date}
                    view={view}
                // onClickDay={handleDayClick}
                // tileClassName={tileClassName}
                // navigationLabel={navigationLabel}
                // onActiveStartDateChange={preventHeaderClick}
                />
            </div>
        );
    }
    const handleDayClick = (value) => {
        setSelectedDate(value);
        setView('day');
    };

    const getEventsForDay = (date) => {
        return events.filter(event => (
            (event.start.toDateString() === date.toDateString() ||
                event.end.toDateString() === date.toDateString()) &&
            event.status.toLowerCase() === 'approved'
        ));
    };

    const renderDayView = () => {
        const dayEvents = getEventsForDay(selectedDate);
        return (
            <div className="day-view-container p-4 rounded-lg ">
                <div className="flex justify-start mb-4">
                    <button className="p-2 rounded-lg text-lg bg-[#3EB489]" onClick={() => setView('month')}>
                        Month View
                    </button>
                </div>

                <h3 className="text-lg font-bold mb-2">Schedule for {selectedDate?.toDateString()}</h3>
                <div className="time-slots overflow-auto max-h-64">
                    {dayEvents.length > 0 ? (
                        <table className="table-auto w-full text-lg border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-primary text-white">
                                    <th className="p-3 text-left">No.</th>
                                    <th className="p-3 text-left">Event Title</th>
                                    <th className="p-3 text-left">Event Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dayEvents
                                    .sort((a, b) => a.start - b.start)
                                    .map((event, index) => (
                                        <tr
                                            onClick={() => handleEventClick(event)}
                                            key={index} className={`rounded-lg ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'} hover:bg-[#3EB489] cursor-pointer `}>
                                            <td className="p-3 text-center font-medium">{event.id.slice(-3)}</td>
                                            <td className="p-3 font-semibold">{event.title}</td>
                                            <td className="p-3 text-center">
                                                {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} -
                                                {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                    ) : (
                        <p>No approved events for today.</p>
                    )}
                </div>

                <Modal isOpen={isModalOpen} close={closeModal}>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold text-[#266D53] text-center">Event Details</h3>
                        <button
                            className="text-sm text-black hover:text-gray-700 transition-colors"
                            onClick={closeModal}
                        >
                            <span className="material-symbols-outlined">
                                close
                            </span>
                        </button>
                    </div>
                    {selectedEvent && (
                        <div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 text-sm text-gray-700">
                                <div>
                                    <p className="font-medium">Title</p>
                                    <p>{selectedEvent.title}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Start</p>
                                    <p>{selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                </div>
                                <div>
                                    <p className="font-medium">End</p>
                                    <p>{selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Status</p>
                                    <p>{selectedEvent.status}</p>
                                </div>
                                {/* Procedures */}
                                <div className="col-span-2 mt-4">
                                    <p className="font-medium text-xl">Procedures</p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        {selectedEvent.procedures.map((procedure, index) => (
                                            <li key={procedure.id || index} className="text-black text-lg text-left">
                                                {procedure.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className='text-right '>
                                <button
                                    className='bg-[#3EB489] hover:bg-[#62A78E] p-3 rounded-lg '
                                    onClick={() => {
                                        closeModal()
                                        navigate(`/appointment/${selectedEvent.id}`)
                                    }}
                                >View Full Details</button>
                            </div>
                        </div>
                    )}
                </Modal>




            </div>
        );
    };

    const renderYearView = () => {
        const year = date.getFullYear();
        const months = [...Array(12).keys()];

        return (
            <div className="year-view-container p-2 rounded-lg text-center bg">
                <h3 className="text-lg font-bold mb-2">Year {year}</h3>
                <div className="flex justify-between mb-2">
                    <button className="px-2 py-1 bg-secondary rounded text-sm" onClick={() => setDate(new Date(year - 1, date.getMonth(), 1))}>
                        Previous Year
                    </button>
                    <button className="px-2 py-1 bg-secondary rounded text-sm" onClick={() => setDate(new Date(year + 1, date.getMonth(), 1))}>
                        Next Year
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {months.map((monthIndex) => {
                        const monthDate = new Date(year, monthIndex, 1);
                        return (
                            <div
                                key={monthIndex}
                                className="month-tile p-1 bg-base-200 rounded-lg cursor-pointer text-sm"
                                onClick={() => {
                                    setDate(monthDate);
                                    setView('month');
                                }}
                            >
                                {monthDate.toLocaleString('default', { month: 'long' })}
                            </div>
                        );
                    })}
                </div>
                <button className="mt-2 px-2 py-1 bg-secondary rounded text-sm" onClick={() => setView('month')}>
                    Month View
                </button>
            </div>
        );
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const eventForDay = getEventsForDay(date);
            if (eventForDay.length > 0) {
                return 'bg-[#3EB489] text-white rounded-full hover:bg-red-600; cursor-pointer ';

            }
        }
        return null;
    };

    const navigationLabel = ({ date }) => (
        <div className="text-sm">
            {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
        </div>
    );

    const preventHeaderClick = ({ activeStartDate, view }) => {
        setDate(date);
        setView(view);
    };

    const goToToday = () => {
        setDate(new Date()); // Reset to today's date
        setView('month'); // Reset view to month
    };

    return (
        <div className="rounded-md bg-[#3EB489] p-5"
            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
            <div className="p-4 rounded-lg mt-5 text-center max-w-4xl mx-auto bg-neutral shadow-lg">

                {/* <h1 className="font-bold text-xl text-green-500 mb-2">Calendar</h1> Adjusted size */}

                <div className="">
                    <button className="rounded-lg text-3xl px-2 py-1 mb-5" onClick={goToToday}>
                        Today
                    </button>
                </div>
                <div className='flex justify-center h-full'>
                    {view === 'month' && (
                        <Calendar
                            className="react-calendar rounded-lg shadow-md text-2xl w-full h-full"
                            onChange={(value) => setDate(value)}
                            value={date}
                            view={view}
                            onClickDay={handleDayClick}
                            tileClassName={tileClassName}
                            navigationLabel={navigationLabel}
                            onActiveStartDateChange={preventHeaderClick}
                        />
                    )}
                </div>
                {view === 'day' && selectedDate && renderDayView()}
                {view === 'year' && renderYearView()}
                <p className='flex items-center text-[#3EB489] text-xl py-2'>
                    {/* <span className='text-red-500'>Note:</span> */}
                    <span className="material-symbols-outlined text-red-500 mx-1 align-middle">
                        info
                    </span>
                    <span>Approved appointments only</span>
                </p>

            </div>
        </div>
    );
}
