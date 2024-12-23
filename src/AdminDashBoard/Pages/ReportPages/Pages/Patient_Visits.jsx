import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BarChart from '../../../Charts/BarChart';
import ReportMenu from '../components/ReportMenu';
import { PDFPatientVisit } from '../../../Component_Functions/PDFReport';
import Swal from 'sweetalert2';

export default function Patient_Visits() {
    const BASEURL = import.meta.env.VITE_BASEURL;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [years, setYears] = useState([]);
    const [visitCounts, setVisitCounts] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0,
    });
    const [period, setPeriod] = useState('today');
    const [filteredReportData, setFilteredReportData] = useState([]);
    const [reportTitle, setReportTitle] = useState('Patient Visits Report');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get(`${BASEURL}/Appointments/appointments/filter/CompletedOnly`);
                setAppointments(response.data);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [BASEURL]);


    useEffect(() => {
        if (appointments.length > 0) {
            const uniqueYears = [...new Set(appointments.map(app => new Date(app.date).getFullYear()))];
            setYears(uniqueYears);
            filterReportData(appointments);
        }
    }, [appointments, selectedYear, selectedMonth, period]);

    useEffect(() => {
        calculateVisitCounts(filteredReportData);
    }, [filteredReportData]);

    const calculateVisitCounts = (filteredAppointments) => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        let todayCount = 0;
        let weekCount = 0;
        let monthCount = 0;
        let yearCount = 0;

        filteredAppointments.forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            if (appointmentDate.toDateString() === today.toDateString()) {
                todayCount++;
            }
            if (appointmentDate >= startOfWeek) {
                weekCount++;
            }
            if (appointmentDate >= startOfMonth) {
                monthCount++;
            }
            if (appointmentDate >= startOfYear) {
                yearCount++;
            }
        });

        setVisitCounts({ today: todayCount, week: weekCount, month: monthCount, year: yearCount });
    };
    const [dateselected, setdateselected] = useState(null);
    const filterReportData = (appointments) => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(selectedYear, selectedMonth, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
        const startOfYear = new Date(selectedYear, 0, 1);

        const filteredData = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);

            if (period === 'today') {
                return appointmentDate.toDateString() === today.toDateString();
            }

            if (period === 'week') {
                return appointmentDate >= startOfWeek && appointmentDate <= today;
            }

            if (period === 'month') {
                return appointmentDate >= startOfMonth && appointmentDate <= endOfMonth;
            }

            if (period === 'year') {
                setdateselected(selectedYear);
                return appointmentDate >= startOfYear && appointmentDate <= new Date(selectedYear + 1, 0, 0);
            }

            if (period === 'selectedDate') {
                return appointmentDate.toDateString() === dateselected?.toDateString();
            }

            return false;
        });

        setFilteredReportData(filteredData);
    };

    const getMonthChartData = () => {
        const visitsByWeek = [];
        const monthDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const startOfMonth = new Date(selectedYear, selectedMonth, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth, monthDays);
        const weekCounts = Math.ceil(monthDays / 7);

        for (let week = 0; week < weekCounts; week++) {
            const weekStart = new Date(startOfMonth);
            weekStart.setDate(weekStart.getDate() + week * 7);

            const weekEnd = new Date(startOfMonth);
            weekEnd.setDate(weekEnd.getDate() + (week + 1) * 7 - 1);

            if (weekEnd > endOfMonth) {
                weekEnd.setDate(monthDays);
            }

            const weekVisits = appointments.filter(appointment => {
                const appointmentDate = new Date(appointment.date);
                return appointmentDate >= weekStart && appointmentDate <= weekEnd;
            }).length;
            visitsByWeek.push(weekVisits);
        }

        const labels = Array.from({ length: weekCounts }, (_, i) => `Week ${i + 1}`);

        return {
            labels,
            datasets: [{
                label: 'Visits per Week',
                data: visitsByWeek,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }],
        };
    };

    const getYearChartData = () => {
        const visitsByMonth = new Array(12).fill(0);

        appointments.forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            const monthIndex = appointmentDate.getMonth();
            if (appointmentDate.getFullYear() === selectedYear) {
                visitsByMonth[monthIndex]++;
            }
        });

        const labels = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];

        return {
            labels,
            datasets: [{
                label: 'Visits per Month',
                data: visitsByMonth,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }],
        };
    };

    const patientVisits = filteredReportData.reduce((acc, appointment) => {
        const patientId = appointment.patient._id;
        const date = new Date(appointment.date);

        if (!acc[patientId]) {
            acc[patientId] = {
                id: patientId,
                name: `${appointment.patient.FirstName} ${appointment.patient.MiddleName || ''} ${appointment.patient.LastName}`,
                lastVisit: date,
                monthYear: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                totalVisits: 1,
            };
        } else {
            if (date > acc[patientId].lastVisit) {
                acc[patientId].lastVisit = date;
                acc[patientId].monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            }
            acc[patientId].totalVisits += 1;
        }
        return acc;
    }, {});

    const reportData = Object.values(patientVisits).map((visit) => ({
        ...visit,
        lastVisit: visit.lastVisit.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
    })).sort((a, b) => {
        const lastNameA = a.name.split(' ').slice(-1)[0].toLowerCase();
        const lastNameB = b.name.split(' ').slice(-1)[0].toLowerCase();
        return lastNameA.localeCompare(lastNameB);
    });

    // Update the report title whenever the period changes
    useEffect(() => {
        const titles = {
            today: 'Patient Visits Today',
            week: 'Patient Visits This Week',
            month: `Patient Visits in ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`,
            year: `Patient Visits in ${selectedYear}`,
        };
        setReportTitle(titles[period]);
    }, [period, selectedYear, selectedMonth]);


    const generatepdf = async () => {
        Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait while the PDF is being generated.',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let filterData;

        if (period === 'today') {
            filterData = {
                day: new Date().getDate(),
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            };
        } else if (period === 'month') {
            filterData = {
                month: selectedMonth + 1,
                year: selectedYear
            };
        } else if (period === 'year') {
            filterData = {
                year: selectedYear
            };
        }

        try {
            const response = await axios.post(`${BASEURL}/generate-report-Patient_Visits`, filterData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'blob',
                withCredentials: true
            });

            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = 'Patient_Visits_Report.pdf';
            link.click();

            Swal.close();
            Swal.fire({
                title: "PDF Generated!",
                text: "Your PDF has been successfully generated.",
                icon: "success"
            });
        } catch (error) {
            Swal.close();
            console.error("Error generating report:", error);
            Swal.fire({
                title: "Error",
                text: "There was an error generating the PDF.",
                icon: "error",
            });
        }
    };





    return (

        <div className="rounded-md"
            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
            <div className="bg-gray-100 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    <div className="flex items-center justify-start sm:items-start">
                        <ReportMenu />
                    </div>
                    <div className="flex justify-center sm:justify-end items-center sm:items-start p-4 sm:p-0 mt-5 mr-5">
                        <button
                            onClick={generatepdf}
                            className="px-4 py-2 bg-[#3FA8BF] hover:bg-[#96D2D9] text-white rounded transition duration-200"
                        >
                            Generate PDF
                        </button>
                    </div>
                </div>
                <div className=" rounded-lg shadow-md p-2">
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-4'>
                        <div className='flex flex-col'>
                            <h2 className="text-2xl font-bold text-[#025373] ml-2">Patient Visits Report</h2>
                        </div>

                        <div className="flex justify-end items-start ml-auto"> {/* Added ml-auto for more right alignment */}
                            <div className="mb-4 flex items-center"> {/* Optional: Set max-width for the dropdown */}
                                <label htmlFor="view-selector" className="block text-sm font-medium text-gray-700 mr-2">
                                    Select Visit Period:
                                </label>
                                <select
                                    id="period-selector"
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="mt-1 block p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                                >
                                    <option value="today">Today </option>
                                    <option value="month" >Month</option>
                                    {/* <option value="week">This Week Visits</option> */}
                                    <option value="year">Year Visits</option>
                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-end space-x-5"> {/* Align everything to the right */}


                        {period === 'month' && (
                            <input
                                type="month"
                                id="month"
                                value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
                                onChange={(e) => {
                                    const [year, month] = e.target.value.split('-');
                                    setSelectedYear(Number(year));
                                    setSelectedMonth(Number(month) - 1); // Convert month back to 0-indexed
                                }}
                                className="border rounded h-10 w-40 shadow-sm mt-8 p-2 focus:ring focus:ring-opacity-50"
                            />
                        )}
                        {period === 'year' && (
                            <div className="py-3 flex items-center"> {/* Align items vertically */}
                                <div className="w-40"> {/* Set width to match month input */}
                                    <label htmlFor="year-selector" className="block text-sm font-medium text-gray-700">Select Year:</label>
                                    <select
                                        id="year-selector"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="border rounded h-10 w-full shadow-sm p-2 focus:ring focus:ring-opacity-50" // Set fixed height and padding
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                    </div>


                    <p className="text-xl font-bold mb-4 ">{reportTitle}</p>

                    <div className="p-4 my-5 bg-[#012840] rounded-md shadow-md text-center">
                        <p className="text-white text-lg font-semibold">
                            Total Visits: <strong>{visitCounts[period]}</strong>
                        </p>
                    </div>


                    {loading ? (
                        <div className="text-center text-gray-600">Loading...</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto pb-8">
                                {reportData.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className='bg-[#012840] text-white'>
                                                <th className="py-2 px-4 border border-black text-center text-sm font-medium ">ID</th>
                                                <th className="py-2 px-4 border border-black text-center text-sm font-medium ">Name</th>
                                                <th className="py-2 px-4 border border-black text-center text-sm font-medium ">Last Visit</th>
                                                {/* <th className="py-2 px-4 border border-black text-center text-sm font-medium ">Visit (Month Year)</th> */}
                                                <th className="py-2 px-4 border border-black text-center text-sm font-medium ">Total Visits</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((visit) => (
                                                <tr key={visit.id} className="transition bg-white">
                                                    <td className="py-2 px-4 border border-black">{visit.id}</td>
                                                    <td className="py-2 px-4 border border-black">{visit.name}</td>
                                                    <td className="py-2 px-4 border border-black">{visit.lastVisit}</td>
                                                    {/* <td className="py-2 px-4 border border-black">{visit.monthYear}</td> */}
                                                    <td className="py-2 px-4 border border-black">{visit.totalVisits}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center text-gray-600">No completed visits found.</div>
                                )}
                            </div>

                            <div className=''>
                                {period === 'month' && (
                                    <>
                                        <h3 className="text-xl font-bold mb-4 text-black">Visits per Week in {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}</h3>
                                        <div className="mb-6">
                                            <BarChart chartData={getMonthChartData()} />
                                        </div>
                                    </>
                                )}
                                {period === 'year' && (
                                    <>
                                        <h3 className="text-xl font-bold mb-4 text-black">Visits per Month in {selectedYear}</h3>
                                        <div className="mb-6 ">
                                            <BarChart chartData={getYearChartData()} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

    );
}
