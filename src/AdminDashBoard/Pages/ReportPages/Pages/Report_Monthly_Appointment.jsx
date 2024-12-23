import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PDFReport } from '../../../Component_Functions/PDFReport';
import BarChart from '../../../Charts/BarChart';
import ReportMenu from '../components/ReportMenu';
import Swal from 'sweetalert2';

export default function Report_Monthly_Appointment() {
    const BASEURL = import.meta.env.VITE_BASEURL;

    const [completedCount, setCompletedCount] = useState(0);
    const [missedCount, setMissedCount] = useState(0);
    const [appointmentsData, setAppointmentsData] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [week, setWeek] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [viewingYearly, setViewingYearly] = useState(false);
    const [isToday, setIsToday] = useState(true);
    const [years, setYears] = useState([]);

    useEffect(() => {
        if (appointmentsData.length > 0) {
            const uniqueYears = [...new Set(appointmentsData.map(app => new Date(app.date).getFullYear()))];
            setYears(uniqueYears);
        }
    }, [appointmentsData]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get(`${BASEURL}/Appointments/appointments/filter`);
                const data = response.data.filter(appointment =>
                    appointment.status === 'Completed' || appointment.status === 'Missed'
                );
                setAppointmentsData(data);
                filterAppointments(data);
            } catch (error) {
                console.error('Error fetching appointment data:', error);
            }
        };

        fetchAppointments();

        const today = new Date();
        setIsToday(month === today.toISOString().slice(0, 7) && selectedYear === today.getFullYear());
    }, [month, selectedYear]);

    const filterAppointments = (appointments) => {
        let filteredData = appointments;

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); 

        const todayISOString = tomorrow.toISOString().split('T')[0]; // Get date in 'YYYY-MM-DD' format

        if (isToday) {
            filteredData = appointments.filter(appointment => {
                const appointmentDate = new Date(appointment.date).toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
                return appointmentDate === todayISOString;
            });
        } else {
            if (viewingYearly) {
                filteredData = appointments.filter(appointment =>
                    appointment.date.startsWith(`${selectedYear}`)
                );
            } else {
                filteredData = filteredData.filter(appointment =>
                    appointment.date.startsWith(`${selectedYear}`)
                );

                if (month) {
                    filteredData = filteredData.filter(appointment =>
                        appointment.date.startsWith(`${selectedYear}-${month.split('-')[1]}`)
                    );
                }

                if (week) {
                    const [weekStart, weekEnd] = week.split(' to ');
                    filteredData = filteredData.filter(appointment =>
                        new Date(appointment.date) >= new Date(weekStart) && new Date(appointment.date) <= new Date(weekEnd)
                    );
                }
            }
        }

        const completed = filteredData.filter(appointment => appointment.status === 'Completed').length;
        const missed = filteredData.filter(appointment => appointment.status === 'Missed').length;

        setCompletedCount(completed);
        setMissedCount(missed);
        setFilteredAppointments(filteredData);
    };


    const getChartData = () => {
        const counts = { completed: [], missed: [] };

        if (!viewingYearly) {
            const monthStart = new Date(`${selectedYear}-${month.split('-')[1]}-01`);
            const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

            let currentWeekStart = new Date(monthStart);
            while (currentWeekStart <= monthEnd) {
                const currentWeekEnd = new Date(currentWeekStart);
                currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
                const weekEnd = currentWeekEnd > monthEnd ? monthEnd : currentWeekEnd;

                const weekData = filteredAppointments.filter(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    return appointmentDate >= currentWeekStart && appointmentDate <= weekEnd;
                });

                counts.completed.push(weekData.filter(appointment => appointment.status === 'Completed').length);
                counts.missed.push(weekData.filter(appointment => appointment.status === 'Missed').length);

                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            }
        } else {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            months.forEach((_, index) => {
                const monthData = filteredAppointments.filter(appointment => {
                    const date = new Date(appointment.date);
                    return date.getFullYear() === selectedYear && date.getMonth() === index;
                });
                counts.completed.push(monthData.filter(appointment => appointment.status === 'Completed').length);
                counts.missed.push(monthData.filter(appointment => appointment.status === 'Missed').length);
            });
        }

        return {
            labels: !viewingYearly ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] :
                ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
                {
                    label: 'Completed Appointments',
                    data: counts.completed,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Missed Appointments',
                    data: counts.missed,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    useEffect(() => {
        filterAppointments(appointmentsData);
    }, [month, week, selectedYear, viewingYearly, isToday]);


    const createPDF = () => {
        // Show loading sweet alert
        Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait while the PDF is being generated.',
            icon: 'info',
            allowOutsideClick: false, // Prevent closing until process is done
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const year = selectedYear || new Date().getFullYear();
        const monthNumber = month ? parseInt(month.split('-')[1]) : null;
        const day = isToday ? new Date().getDate() : null;

        const data = { year };

        if (monthNumber && !viewingYearly && !isToday) {
            data.month = monthNumber;
        }

        if (isToday) {
            data.day = day;
            data.month = new Date().getMonth() + 1;
        }

        axios
            .post(`${BASEURL}/generate-report-Completed_and_Missed`, data, {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'blob',
                withCredentials: true,
            })
            .then((response) => {
                // Hide loading and trigger success message
                Swal.close();
                const fileURL = URL.createObjectURL(response.data);
                const link = document.createElement('a');
                link.href = fileURL;
                link.download = `completed_missed_report_${year}_${monthNumber || ''}_${day || ''}.pdf`;
                link.click();
                Swal.fire({
                    title: "PDF Generated!",
                    text: "Your PDF has been successfully generated.",
                    icon: "success"
                });
            })
            .catch((error) => {
                // Hide loading and trigger error message
                Swal.close();
                console.error('Error generating PDF:', error);
                Swal.fire({
                    title: "Error",
                    text: "There was an error generating the PDF.",
                    icon: "error",
                });
            });
    };





    return (
        <div className="rounded-md"
            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
            <div className="bg-gray-100 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {/* ReportMenu Component */}
                    <div className="flex justify-center sm:justify-start items-start">
                        <ReportMenu />
                    </div>
                    <div className="flex justify-center sm:justify-end items-center sm:items-start p-4 sm:p-0">
                        <button
                            onClick={createPDF}
                            className="px-4 py-2 bg-[#3FA8BF] hover:bg-[#96D2D9] text-white rounded transition duration-200"
                        >
                            Generate PDF
                        </button>
                    </div>
                </div>

                <div className=" rounded-lg shadow-md p-2">
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-4'>
                        <div className='flex flex-col'>
                            <div>
                                <h2 className="text-2xl font-bold text-[#025373] ml-2">Appointment Report</h2>
                                <h1 className="text-1xl pb-7 ml-2">
                                    {new Date().toLocaleString('default', { month: 'long' })} {new Date().getDate()}, {new Date().getFullYear()}
                                </h1>
                            </div>
                        </div>

                        <div className="flex justify-end items-center mb-4">
                            <label htmlFor="view-selector" className="block text-sm font-medium text-gray-700 mr-2">
                                Select View:
                            </label>
                            <select
                                id="view-selector"
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    if (selectedValue === 'today') {
                                        setMonth(new Date().toISOString().slice(0, 7));
                                        setIsToday(true);
                                        setViewingYearly(false);
                                    } else if (selectedValue === 'monthly') {
                                        setIsToday(false);
                                        setViewingYearly(false);
                                    } else if (selectedValue === 'yearly') {
                                        setViewingYearly(true);
                                        setIsToday(false);
                                        setMonth(new Date().toISOString().slice(0, 7)); // Optionally set to current month
                                    }
                                }}
                                className="mt-1 block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                            >
                                <option value="" disabled>Select a view</option>
                                <option value="today">Today</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>
                    <div className="pb-7 flex flex-col sm:flex-row items-center space-y-4 justify-end sm:space-y-0 sm:space-x-3">
                        {!viewingYearly ? (
                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 items-center">
                                {!isToday ? (
                                    <>
                                        {/* Month Input */}
                                        <input
                                            type="month"
                                            id="month"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                            className="w-full sm:w-auto p-2 border rounded shadow-sm"
                                        />

                                        {/* Previous Month Button */}
                                        <button
                                            onClick={() =>
                                                setMonth(
                                                    new Date(new Date(month).setMonth(new Date(month).getMonth() - 1))
                                                        .toISOString()
                                                        .slice(0, 7)
                                                )
                                            }
                                            className="w-full sm:w-auto px-4 py-2 bg-[#025373] hover:bg-[#03738C] text-white rounded transition duration-200"
                                            aria-label="Previous Month"
                                        >
                                            Previous Month
                                        </button>

                                        {/* Next Month Button */}
                                        <button
                                            onClick={() =>
                                                setMonth(
                                                    new Date(new Date(month).setMonth(new Date(month).getMonth() + 1))
                                                        .toISOString()
                                                        .slice(0, 7)
                                                )
                                            }
                                            className="w-full sm:w-auto px-4 py-2 bg-[#025373] hover:bg-[#03738C] text-white rounded  transition duration-200"
                                            aria-label="Next Month"
                                        >
                                            Next Month
                                        </button>
                                    </>
                                ) : (
                                    <>

                                    </>
                                )}

                            </div>
                        ) : (
                            <div className="w-40"> {/* Full width for year selector */}
                                {/* Year Select */}
                                <div className="mb-4 w-full">
                                    <label htmlFor="year-selector" className="block text-sm font-medium text-gray-700">Select Year:</label>
                                    <select
                                        id="year-selector"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className=''>
                        {/* Display Counts for Completed and Missed Appointments */}
                        <div className="">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-center p-6 bg-green-100 rounded-lg shadow-lg">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-green-700">Completed Appointments</h3>
                                        <p className="text-xl text-green-900">{completedCount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center p-6 bg-red-100 rounded-lg shadow-lg">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-red-700">Missed Appointments</h3>
                                        <p className="text-xl text-red-900">{missedCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conditionally render chart or table based on today's report */}
                        {isToday ? (
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold mt-10  text-center sm:text-left">Today's Appointments</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full  border border-black text-black mt-2 text-sm sm:text-base">
                                        <thead>
                                            <tr>
                                                <th className="border bg-[#012840] border-black p-2 text-white text-center">Patient Name</th>
                                                <th className="border bg-[#012840] border-black p-2 text-white text-center">Status</th>
                                                <th className="border bg-[#012840] border-black p-2 text-white text-center">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAppointments.map((appointment, index) => (
                                                <tr key={index}>
                                                    <td className="border border-black p-2 bg-white">
                                                        {appointment.patient.LastName} {appointment.patient.FirstName}
                                                    </td>
                                                    <td className={`border border-black p-2 bg-white font-bold ${appointment.status === 'Completed' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {appointment.status}
                                                    </td>
                                                    <td className="border border-black bg-white p-2">
                                                        {new Date(appointment.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* Render the chart */}
                                <div className="hidden sm:block">
                                    <BarChart chartData={getChartData()} />
                                </div>

                                {/* Appointment summary if applicable */}
                                {isToday && (
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold mt-4 text-center sm:text-left">Appointment Summary</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full bg-[#3EB489] border border-black mt-2 text-sm sm:text-base">
                                                <thead>
                                                    <tr>
                                                        <th className="border border-black p-2 text-center">Patient Name</th>
                                                        <th className="border border-black p-2 text-center">Status</th>
                                                        <th className="border border-black p-2 text-center">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredAppointments.map((appointment) => (
                                                        <tr key={appointment._id}>
                                                            <td className="border border-black bg-gray-100 p-2">
                                                                {appointment.patient.LastName} {appointment.patient.FirstName}
                                                            </td>
                                                            <td className={`border border-black p-2 font-bold ${appointment.status === 'Completed' ? 'text-green-500' : 'text-red-500'}`}>
                                                                {appointment.status}
                                                            </td>
                                                            <td className="border border-black p-2">
                                                                {new Date(appointment.date).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
