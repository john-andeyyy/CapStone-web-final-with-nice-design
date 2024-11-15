import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

dayjs.extend(isBetween);

const BASEURL = import.meta.env.VITE_BASEURL;

const DentistSchedule = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dentistId = id || localStorage.getItem('Accountid');

    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState('');
    const [dentistName, setDentistName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${BASEURL}/dentist/appointmentlist/${dentistId}`, { withCredentials: true });
                if (response.status === 200) {
                    const approvedAppointments = response.data
                    setDentistName(response.data[0]?.DentistName || 'N/A');
                    setAppointments(approvedAppointments);
                    filterAppointments(approvedAppointments, filter, selectedYear, searchTerm);
                } else {
                    setError('No appointments found.');
                }
            } catch (err) {
                console.error('Error fetching appointments:', err);
                setError('Error fetching appointments.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [dentistId]);

    useEffect(() => {
        filterAppointments(appointments, filter, selectedYear, searchTerm);
    }, [filter, customDateRange, selectedYear, searchTerm, appointments]);

    const filterAppointments = (appointments, selectedFilter, year, search) => {
        const now = dayjs();
        let filtered = appointments;

        if (year) {
            filtered = filtered.filter(appointment => dayjs(appointment.date).year() === parseInt(year, 10));
        }

        if (search) {
            filtered = filtered.filter(appointment =>
                `${appointment.patient.FirstName} ${appointment.patient.LastName}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        switch (selectedFilter) {
            case 'thisDay':
                filtered = filtered.filter(appointment => dayjs(appointment.date).isSame(now, 'day'));
                break;
            case 'thisWeek':
                filtered = filtered.filter(appointment => dayjs(appointment.date).isSame(now, 'week'));
                break;
            case 'thisMonth':
                filtered = filtered.filter(appointment => dayjs(appointment.date).isSame(now, 'month'));
                break;
            case 'customDate':
                const { start, end } = customDateRange;
                if (start && end) {
                    filtered = filtered.filter(appointment =>
                        dayjs(appointment.date).isBetween(dayjs(start), dayjs(end), 'day', '[]')
                    );
                } else {
                    filtered = [];
                }
                break;
            case 'completed':  
                filtered = filtered.filter(appointment => appointment.Status === 'Completed');
                break;
            case 'Approved':  
                filtered = filtered.filter(appointment => appointment.Status === 'Approved');
                break;
            case 'all':  
                
                break;
            default:
                break;
        }
        filtered.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

        setFilteredAppointments(filtered);
    };

    const handleCustomDateChange = (dates) => {
        const [start, end] = dates;
        setCustomDateRange({ start, end });
        if (start && end) {
            setFilter('customDate');
        }
    };

    const toggleDatePicker = () => {
        setShowCustomDatePicker(!showCustomDatePicker);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
        setFilter(event.target.value ? 'year' : '');
    };

    const handleRowClick = (appointment) => {
        navigate(`/appointment/${appointment._id}`);
    };

    if (loading) {
        return <div className="text-center py-4">Loading appointments...</div>;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-20 min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg text-center shadow-md">
                    <div className='flex justify-center'>
                        <span className="material-symbols-outlined">warning</span>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 min-h-screen">
            {localStorage.getItem('Role') !== 'dentist' && (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-[#3EB489] hover:text-[#62A78E] mb-3 font-semibold focus:outline-none"
                >
                    <span className="material-symbols-outlined text-2xl mr-2">arrow_back</span>
                    <p className="text-lg sm:text-xl">Go Back</p>
                </button>
            )}

            <div className="mb-4 space-y-3 ">
                <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-10">Appointment Schedule</h2>
                <h3 className="text-lg sm:text-xl font-bold">Dr. {dentistName}</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-4">
  
  {/* Search by Patient Name */}
  <div className="flex-1 mb-4 sm:mb-0">
    {/* <label htmlFor="searchName" className="block sm:inline mr-2 font-semibold">Search Patient:</label> */}
    <div className="relative flex-grow">
    <input
      type="text"
      id="searchName"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search patients..."
      className="block pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
    />
    <div className="absolute left-3 top-3 h-4 w-4 text-gray-500">
        <span className="material-symbols-outlined">search</span>
    </div>
    </div>
  </div>

  {/* Filter Section */}
  <div className="flex-1 sm:flex sm:justify-end items-center space-y-4 sm:space-y-0">
    <div className="sm:flex sm:items-center">
      <label htmlFor="dateFilter" className="block sm:inline mr-2 font-semibold">Filter by:</label>
      <select
        id="dateFilter"
        value={filter}
        onChange={(e) => {
          const value = e.target.value;
          setFilter(value);
          if (value !== 'customDate') {
            setShowCustomDatePicker(false);
          }
          if (value === '') {
            setSelectedYear('');
          }
        }}
        className="p-2 border bg-gray-100 rounded w-full sm:w-auto"
      >
        <option value="Approved">Approved</option>
        <option value="completed">Completed</option>
        <option value="all">All</option>
        <option value="thisDay">This Day</option>
        <option value="thisWeek">This Week</option>
        <option value="thisMonth">This Month</option>
        <option value="year">By Year</option>
        <option value="customDate">Custom Date</option>
      </select>
    </div>

    {/* Year Filter */}
    {filter === 'year' && (
      <div className="mt-4 sm:mt-0 sm:ml-4 inline-block">
        <label htmlFor="year" className="mr-2 font-semibold">Select Year:</label>
        <select
          id="year"
          value={selectedYear}
          onChange={handleYearChange}
          className="p-2 border rounded w-full sm:w-auto"
        >
          <option value="">--Select Year--</option>
          {[...Array(101).keys()].map((i) => {
            const yearValue = new Date().getFullYear() - i;
            return (
              <option key={yearValue} value={yearValue}>
                {yearValue}
              </option>
            );
          })}
        </select>
      </div>
    )}

    {/* Custom Date Picker */}
    {filter === 'customDate' && (
      <div className="mt-4 relative">
      <button
        className="bg-blue-500 text-white p-2 ml-2 rounded w-full sm:w-auto"
        onClick={toggleDatePicker}
      >
        Select Date
      </button>
    
      {showCustomDatePicker && (
        <div className="absolute z-10 mt-2 right-5 w-full sm:w-auto bg-white p-4 border rounded shadow-lg">
          <label className="mr-2 font-semibold">Select Date Range:</label>
          <DatePicker
            selected={customDateRange.start}
            onChange={handleCustomDateChange}
            startDate={customDateRange.start}
            endDate={customDateRange.end}
            selectsRange
            inline
            className="p-2 border rounded"
            todayButton="Today"
          />
          {customDateRange.start && customDateRange.end && (
            <div className="mt-2 text-sm text-gray-600">
              Selected Range: {dayjs(customDateRange.start).format('MMM D, YYYY')} - {dayjs(customDateRange.end).format('MMM D, YYYY')}
            </div>
          )}
        </div>
      )}
    </div>
    )}
  </div>
</div>

            {filteredAppointments.length ? (
                <table className="w-full bg-white border border-black overflow-auto">
                    <thead>
                        <tr className="bg-[#012840] text-white text-sm sm:text-base">
                            <th className="py-2 px-2 sm:px-4 border border-black">Date</th>
                            <th className="py-2 px-2 sm:px-4 border border-black">Start</th>
                            <th className="py-2 px-2 sm:px-4 border border-black">Patient Name</th>
                            <th className="py-2 px-2 sm:px-4 border border-black">Procedure</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.map((appointment) => (
                            <tr
                                key={appointment._id}
                                className="hover:bg-gray-100 border border-black cursor-pointer text-sm sm:text-base"
                                onClick={() => handleRowClick(appointment)}
                            >
                                <td className="py-2 px-2 sm:px-4 border border-black">
                                    {dayjs(appointment.date).format('MMM D, YYYY')}
                                </td>
                                <td className="py-2 px-2 sm:px-4 border border-black">
                                    {dayjs(appointment.Start).format('h:mm A')}
                                </td>
                                <td className="py-2 px-2 sm:px-4 border border-black">
                                    {`${appointment.patient.FirstName} ${appointment.patient.LastName}`}
                                </td>
                                <td className="py-2 px-2 sm:px-4 border border-black">
                                    {appointment.procedures.map((proc) => proc.Procedure_name).join(', ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center text-gray-500 mt-4">
                    {filter === 'customDate' ? (
                        <p>Please select a custom date range to view appointments.</p>
                    ) : (
                        <p>No approved appointments found for the selected filters.</p>
                    )}
                </div>
            )}
        </div>
    );

};

export default DentistSchedule;
