import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReportMenu from '../components/ReportMenu';
import { format } from 'date-fns'; // Import date-fns for formatting dates
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable
import Swal from 'sweetalert2';

const AppointmentsReport = () => {
    const [appointments, setAppointments] = useState([]);
    const [reportData, setReportData] = useState({ daily: {}, monthly: {}, yearly: {} });
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState('daily');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const yearsAvailable = [...new Set(appointments.map(appointment => new Date(appointment.date).getFullYear()))];

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASEURL}/Appointments/appointments/filter`);
                if (Array.isArray(response.data)) {
                    setAppointments(response.data);
                } else {
                    throw new Error('Expected an array of appointments');
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
                setError('Failed to fetch appointments.');
            }
        };

        fetchAppointments();
    }, []);

    useEffect(() => {
        const generateReport = () => {
            const daily = {};
            const monthly = {};
            const yearly = {};

            appointments.forEach(appointment => {
                if (appointment.status === 'Completed') {
                    const date = new Date(appointment.date);
                    const dayKey = date.toISOString().split('T')[0];
                    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    const yearKey = date.getFullYear();

                    daily[dayKey] = (daily[dayKey] || 0) + appointment.amount;
                    monthly[monthKey] = (monthly[monthKey] || 0) + appointment.amount;
                    yearly[yearKey] = (yearly[yearKey] || 0) + appointment.amount;
                }
            });

            setReportData({ daily, monthly, yearly });
        };

        if (appointments.length > 0) {
            generateReport();
        }
    }, [appointments]);

    const handleReportChange = (reportType) => {
        setSelectedReport(reportType);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleTodayClick = () => {
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
    };

    const generatePDF = () => {
        createPDF();

    };


    const createPDF = async () => {
        Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait while the PDF is being generated.',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let filterData = {};

        if (selectedReport === 'daily') {
            filterData = {
                year: selectedYear.toString(),
                month: selectedMonth.toString().padStart(2, '0'),
                day: selectedDate.split('-')[2]
            };
        } else if (selectedReport === 'monthly') {
            filterData = {
                year: selectedYear.toString(),
                month: selectedMonth.toString().padStart(2, '0')
            };
        } else if (selectedReport === 'yearly') {
            filterData = {
                year: selectedYear.toString()
            };
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASEURL}/generate-report-Income_Report`,
                filterData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    responseType: 'blob',
                    withCredentials: true
                }
            );

            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = 'Income_Report.pdf';
            link.click();

            Swal.close();
            Swal.fire({
                title: "PDF Generated!",
                text: "Your PDF has been successfully generated.",
                icon: "success"
            });
        } catch (error) {
            Swal.close();
            const errorMessage = error.response?.data?.message || "An unknown error occurred. Please try again later.";

            Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error"
            });
        }
    };



    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    return (
        <div className="rounded-md"
            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
            <div className="bg-gray-100 rounded-md">

                {/* <div className=""> */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 ">
                    <div className='flex items-center justify-start sm:items-start'>
                        <ReportMenu />
                    </div>

                    <div className="flex justify-center sm:justify-end items-center sm:items-start p-4 sm:p-5">
                        <button
                            className="px-4 py-2 bg-[#3FA8BF] hover:bg-[#96D2D9] text-white rounded transition duration-200 w-full sm:w-auto"
                            onClick={generatePDF}
                        >
                            Generate PDF
                        </button>
                    </div>
                </div>

                <div className='rounded-lg shadow-md p-2'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-4'>
                        <div className='flex flex-col'>
                            <h1 className="text-xl sm:text-2xl text-[#025373] font-bold p-2 text-center sm:text-left">Income Report</h1>
                        </div>

                        <div className="flex justify-end items-center"> {/* Center the items vertically */}
                            <div className="mb-4 flex items-center">
                                <label htmlFor="report-selector" className="block text-sm font-medium text-gray-700 mr-2"> {/* Added margin for spacing */}
                                    Select Report Type:
                                </label>
                                <select
                                    id="report-selector"
                                    onChange={(e) => handleReportChange(e.target.value)}
                                    className="mt-1 block p-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                                >
                                    <option value="" disabled>Select a report type</option>
                                    <option value="daily">Daily Report</option>
                                    <option value="monthly">Monthly Report</option>
                                    <option value="yearly">Yearly Report</option>
                                </select>
                            </div>
                        </div>
                    </div>



                    {/* Report Type Buttons */}
                    {/* <div className="mb-4">
                    <button className="bg-green-500 text-white py-2 px-4 rounded mx-2" onClick={() => handleReportChange('daily')}>Daily Report</button>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded mx-2" onClick={() => handleReportChange('monthly')}>Monthly Report</button>
                    <button className="bg-yellow-500 text-white py-2 px-4 rounded mx-2" onClick={() => handleReportChange('yearly')}>Yearly Report</button>
                </div> */}


                    {/* Date Picker for Daily Report */}
                    {/* {selectedReport === 'daily' && (
                    <div className="mb-4">
                        <label htmlFor="date-picker" className="mr-2">Select Date:</label>
                        <input
                            type="date"
                            id="date-picker"
                            className="border rounded px-2 py-1"
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                        {/* Today's Button */}
                    {/* {selectedDate !== new Date().toISOString().split('T')[0] && (
                            <button
                                className="ml-4 bg-gray-500 text-white py-2 px-4 rounded"
                                onClick={handleTodayClick}
                            >
                                Today
                            </button>
                        )}
                    </div> */}
                    {/* )} */}
                    <div className="relative mb-4">
                        {selectedReport === 'daily' && (
                            <div className="absolute right-0 top-0 mb-4 flex items-center space-x-2 sm:space-x-4">
                                <label htmlFor="date-picker" className="mr-2">Select Date:</label>
                                <input
                                    type="date"
                                    id="date-picker"
                                    className="border rounded px-2 py-1"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                />
                                {/* Today's Button */}
                                {selectedDate !== new Date().toISOString().split('T')[0] && (
                                    <button
                                        className="ml-4 bg-gray-500 text-white py-2 px-4 rounded"
                                        onClick={handleTodayClick}
                                    >
                                        Today
                                    </button>
                                )}
                            </div>
                        )}
                    </div>


                    <div className="relative mb-4">
                        {(selectedReport === 'monthly' || selectedReport === 'yearly') && (
                            <div className="absolute right-0 top-0 mb-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                {/* Month Selector */}
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="month-select" className="mr-2">Select Month:</label>
                                    <select
                                        id="month-select"
                                        className="border rounded px-2 py-1 mr-2"
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                    >
                                        {[...Array(12)].map((_, index) => (
                                            <option key={index} value={index + 1}>
                                                {new Date(0, index).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year Selector for Yearly Reports */}
                                {selectedReport === 'yearly' && (
                                    <div className="flex items-center">
                                        <label htmlFor="year-select" className="mr-2">Select Year:</label>
                                        <select
                                            id="year-select"
                                            className="border rounded px-2 py-1"
                                            value={selectedYear}
                                            onChange={handleYearChange}
                                        >
                                            {yearsAvailable.map(year => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    {/* Display the selected report */}
                    {selectedReport === 'daily' && (
                        <>
                            <h2 className="text-xl font-semibold mb-2">Daily Report for {format(new Date(selectedDate), 'MMM dd yyyy')}</h2>
                            <table className="min-w-full border border-black">
                                <thead>
                                    <tr className="bg-[#012840] text-white">
                                        <th className="border border-black px-4 py-2">Date</th>
                                        <th className="border border-black px-4 py-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(reportData.daily).map(([day, amount]) => {
                                        if (day === selectedDate) {
                                            return (
                                                <tr key={day} className=" hover:text-black bg-white">
                                                    <td className="border border-black px-4 py-2">{format(new Date(day), 'MMM dd yyyy')}</td>
                                                    <td className="border border-black px-4 py-2">{amount}</td>
                                                </tr>
                                            );
                                        }
                                        return null;
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}

                    {selectedReport === 'monthly' && (
                        <>
                            <h2 className="text-xl font-semibold mb-2">Monthly Report for {format(new Date(new Date().getFullYear(), selectedMonth - 1), 'MMMM')}</h2>
                            <table className="min-w-full border border-black">
                                <thead>
                                    <tr className="bg-[#012840]">
                                        <th className="border px-4 py-2 text-white  border-black">Month</th>
                                        <th className="border px-4 py-2 text-white  border-black">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(reportData.monthly).map(([month, amount]) => {
                                        if (month.split('-')[1] === selectedMonth.toString()) {
                                            return (
                                                <tr key={month} className="bg-white hover:text-black">
                                                    <td className="border border-black px-4 py-2">{format(new Date(month + '-01'), 'MMMM yyyy')}</td>
                                                    <td className="border border-black  px-4 py-2">{amount}</td>
                                                </tr>
                                            );
                                        }
                                        return null;
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}

                    {selectedReport === 'yearly' && (
                        <>
                            <h2 className="text-xl font-semibold mb-2">Yearly Report for {selectedYear}</h2>
                            <table className="min-w-full border border-black">
                                <thead>
                                    <tr className="bg-[#012840]">
                                        <th className="border  border-black  px-4 py-2 text-white text-center">Year</th>
                                        <th className="border  border-black px-4 py-2 text-white text-center">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr key={selectedYear} className="bg-white hover:text-black">
                                        <td className="border border-black  px-4 py-2">{selectedYear}</td>
                                        <td className="border border-black  px-4 py-2">
                                            PHP {reportData.yearly[selectedYear] || 0}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-[#012840]">
                                        <td className="border border-black px-4 py-2 font-bold text-white text-center">Total</td>
                                        <td className="border border-black px-4 py-2 text-white font-bold">
                                            PHP {reportData.yearly[selectedYear] || 0}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </>
                    )}


                </div>
                {/* </div> */}
            </div>
        </div>
    );
};

export default AppointmentsReport;
