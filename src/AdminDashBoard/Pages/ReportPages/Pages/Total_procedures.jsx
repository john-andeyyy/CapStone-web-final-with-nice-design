import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import PieChart from '../../../Charts/PieChart';
import ReportMenu from '../components/ReportMenu';
import Swal from 'sweetalert2';

export default function TotalProcedures() {
    const [procedureReport, setProcedureReport] = useState({});
    const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
    const [currentYear, setCurrentYear] = useState(dayjs().year());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isYearView, setIsYearView] = useState(false);
    const BASEURL = import.meta.env.VITE_BASEURL;
    const [years, setYears] = useState([]);
    const [appointmentsData, setappointmentsData] = useState();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.format('MM'));
    const [selectedFrequency, setSelectedFrequency] = useState('');

    useEffect(() => {
        if (Array.isArray(appointmentsData) && appointmentsData.length > 0) {
            const uniqueYears = [...new Set(appointmentsData.map(app => new Date(app.date).getFullYear()))];
            uniqueYears.sort((a, b) => b - a);
            setYears(uniqueYears);
        }
    }, [appointmentsData]);


    useEffect(() => {
        const fetchApprovedAppointments = async () => {
            try {
                const response = await axios.get(`${BASEURL}/Appointments/appointments/filter/CompletedOnly`);
                const appointments = response.data;
                setappointmentsData(appointments)
                const report = {};

                // Iterate through each appointment
                appointments.forEach(appointment => {
                    const appointmentYear = dayjs(appointment.date).year();
                    const appointmentMonth = dayjs(appointment.date).format('YYYY-MM');

                    // Check if appointment should be included based on view
                    if (isYearView ? appointmentYear === currentYear : appointmentYear === currentYear && appointmentMonth === currentMonth.format('YYYY-MM')) {
                        const monthKey = isYearView ? appointmentMonth.substring(0, 7) : appointmentMonth;
                        appointment.procedures.forEach(procedure => {
                            const procedureName = procedure.name;

                            if (!report[monthKey]) {
                                report[monthKey] = {};
                            }
                            if (!report[monthKey][procedureName]) {
                                report[monthKey][procedureName] = 0;
                            }

                            report[monthKey][procedureName] += 1;
                        });
                    }
                });

                // If in year view, aggregate data across months
                if (isYearView) {
                    const aggregatedReport = {};
                    for (const month in report) {
                        for (const procedureName in report[month]) {
                            if (!aggregatedReport[procedureName]) {
                                aggregatedReport[procedureName] = 0;
                            }
                            aggregatedReport[procedureName] += report[month][procedureName];
                        }
                    }
                    setProcedureReport({ [currentYear]: aggregatedReport });
                } else {
                    setProcedureReport(report);
                }
            } catch (error) {
                console.error('Error fetching approved appointments:', error);
            }
        };

        fetchApprovedAppointments();
    }, [currentMonth, currentYear, isYearView]);

    const handlePrevMonth = () => {
        setCurrentMonth(currentMonth.subtract(1, 'month'));
        setCurrentYear(currentMonth.subtract(1, 'month').year());
    };

    const handleNextMonth = () => {
        setCurrentMonth(currentMonth.add(1, 'month'));
        setCurrentYear(currentMonth.add(1, 'month').year());
    };

    const handleYearChange = (event) => {
        const year = event.target.value;
        setSelectedYear(year);
        if (year) {
            setCurrentYear(Number(year));
            setCurrentMonth(dayjs().year(Number(year)).startOf('month'));
            setIsYearView(true);
        }
    };

    const handleToday = () => {
        const today = dayjs();
        setCurrentMonth(today.startOf('month'));
        setCurrentYear(today.year());
        setSelectedYear('');
        setIsYearView(false);
    };
    const saveAsPDF = () => {
        createPDF();

        Swal.fire({
            title: "PDF Generated!",
            text: "Your PDF has been successfully generated.",
            icon: "success"
        });
    };

    const createPDF = () => {
        // Show SweetAlert loading spinner
        const swalLoading = Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait while we generate your report.',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading(); // Show the loading spinner
            }
        });

        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth.format('MM');

        console.log('year', year);
        console.log('month', month);

        const data = { year: year };

        if (!isYearView && selectedMonth) {
            data.month = parseInt(month);
        }

        axios
            .post(`${BASEURL}/generate-report-proceduredone`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'blob',
                withCredentials: true,
            })
            .then((response) => {
                const fileURL = URL.createObjectURL(response.data);

                // Create a link element to trigger the download
                const link = document.createElement('a');
                link.href = fileURL;
                link.download = `procedures_report_${year}_${month}.pdf`;
                link.click();

                // Close the loading SweetAlert after file download
                swalLoading.close();

                Swal.fire({
                    title: "PDF Generated!",
                    text: "Your PDF has been successfully generated.",
                    icon: "success"
                });
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);

                // Close the loading SweetAlert and show error message
                swalLoading.close();

                Swal.fire({
                    title: "Error",
                    text: "There was an error generating the PDF.",
                    icon: "error",
                });
            });
    };





    const formattedMonth = currentMonth.format('MMMM YYYY');
    const currentReport = isYearView ? procedureReport[currentYear] || {} : procedureReport[currentMonth.format('YYYY-MM')] || {};
    const isToday = currentMonth.isSame(dayjs().startOf('month'), 'month') && currentYear === dayjs().year();

    const labels = Object.keys(currentReport);

    const primaryColors = [
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 99, 132, 0.6)',
    ];

    const getSoftPrimaryColors = (numColors) => {
        const colors = [];
        const availableColors = [...primaryColors];
        for (let i = 0; i < numColors; i++) {
            if (availableColors.length === 0) {
                const lastColor = colors[colors.length - 1];
                const rgb = lastColor.match(/\d+/g).map(Number);
                const newColor = `rgba(${rgb[0] + 20}, ${rgb[1] + 20}, ${rgb[2] + 20}, 0.6)`;
                colors.push(newColor);
            } else {
                const randomIndex = Math.floor(Math.random() * availableColors.length);
                colors.push(availableColors[randomIndex]);
                availableColors.splice(randomIndex, 1);
            }
        }
        return colors;
    };

    const datasets = [
        {
            label: 'Procedure Counts',
            data: Object.values(currentReport),
            backgroundColor: getSoftPrimaryColors(Object.keys(currentReport).length),
            borderColor: getSoftPrimaryColors(Object.keys(currentReport).length).map(color => color.replace(/0\.6/, '1')),
            borderWidth: 1,
        },
    ];

    return (
        <div className="rounded-md"
            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
            <div className="bg-gray-100 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    <div className="flex items-center justify-start sm:items-start">
                        <ReportMenu />
                    </div>

                    <div className="flex justify-center sm:justify-end items-center sm:items-start p-4 sm:p-5">
                        <button
                            onClick={saveAsPDF}
                            className="px-4 py-2 bg-[#3FA8BF] hover:bg-[#96D2D9] text-white rounded transition duration-200 w-full sm:w-auto"
                        >
                            Generate PDF
                        </button>
                    </div>
                </div>


                <div className=" rounded-lg shadow-md p-2">
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-4'>
                        <div className='flex flex-col'>
                            <h1 className="text-xl sm:text-2xl text-[#025373] font-bold p-2 text-center sm:text-left">
                                Total Procedures Done {isYearView ? `in ${currentYear}` : `in ${formattedMonth}`}
                            </h1>
                        </div>

                        <div className="flex justify-center sm:justify-end items-center sm:items-start p-2">
                            <div className="flex items-center">
                                <label htmlFor="period-selector" className="block text-sm font-medium text-gray-700 mr-2">
                                    Select Frequency:
                                </label>
                                <select
                                    id="navigation-dropdown"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedFrequency(value);
                                        if (value === 'year') {
                                            setIsYearView(true);
                                        } else if (value === 'month') {
                                            setIsYearView(false);
                                            setCurrentMonth(dayjs().month(selectedMonth - 1).year(currentYear));
                                        } else if (value === 'prevMonth') {
                                            handlePrevMonth();
                                        } else if (value === 'nextMonth') {
                                            handleNextMonth();
                                        } else if (value === 'today' && (!isToday || isYearView)) {
                                            handleToday();
                                        }
                                    }}
                                    className="block p-2 border bg-gray-100 border-gray-400 rounded-md focus:outline-none transition max-w-full sm:max-w-xs"
                                >
                                    <option value="">Select an option</option>
                                    <option value="year">View Year</option>
                                    <option value="month">Month</option>
                                </select>
                                {selectedFrequency === 'month' && (
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => {
                                            const month = e.target.value;
                                            setSelectedMonth(month);
                                            setCurrentMonth(dayjs().month(month - 1).year(currentYear));
                                            setIsYearView(false);
                                        }}
                                        className="ml-2 p-2 block border border-gray-300 bg-gray-100 rounded-md w-full sm:w-auto"
                                    >
                                        <option value="01">January</option>
                                        <option value="02">February</option>
                                        <option value="03">March</option>
                                        <option value="04">April</option>
                                        <option value="05">May</option>
                                        <option value="06">June</option>
                                        <option value="07">July</option>
                                        <option value="08">August</option>
                                        <option value="09">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>



                    <div className="w-full pr-4 rounded-lg overflow-y-auto">
                        <div className="pb-7 flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3">
                            {isYearView && (
                                // <div className="inline-block">
                                <div className="w-full flex justify-end"> {/* Use justify-end to align the selector to the right */}
                                    <div className="mb-4 "> {/* Optional: Set a max-width for better control */}
                                        <label htmlFor="year-selector" className="block text-sm font-medium text-gray-700">
                                            Select Year:
                                        </label>
                                        <select
                                            id="year-selector"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                            className="mt-1 p-2 block w-full border bg-gray-100 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                                        >
                                            <option value="">--Select Year--</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5">
                        {/* Left Column: Scrollable Area */}
                        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                            <table className="min-w-full border">
                                <thead>
                                    <tr className='bg-[#012840] text-white'>
                                        <th className="py-2 px-4 border-b font-bold text-left border border-black ">Procedure Name</th>
                                        <th className="py-2 px-4 border-b font-bold text-left border border-black ">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(currentReport).length > 0 ? (
                                        Object.keys(currentReport).map(procedureName => (
                                            <tr key={procedureName} className="hover:bg-gray-100 bg-white">
                                                <td className="py-2 px-4 border-b border border-black">{procedureName}</td>
                                                <td className="py-2 px-4 border-b border border-black">{currentReport[procedureName]}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="py-2 px-4 text-center">No procedures recorded for this month/year.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Responsive Pie Chart */}
                        <div className="rounded-xl"
                            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
                            <div className="mt-4 sm:mt-0 bg-[#96D2D9]  py-3 rounded-xl">
                                {Object.keys(currentReport).length > 0 ? (
                                    <PieChart labels={labels} datasets={datasets} title={`Total Procedures Done ${isYearView ? `in ${currentYear}` : `in ${formattedMonth}`}`} />
                                ) : (
                                    <div className="text-center text-gray-700">No procedures recorded for this month/year.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
