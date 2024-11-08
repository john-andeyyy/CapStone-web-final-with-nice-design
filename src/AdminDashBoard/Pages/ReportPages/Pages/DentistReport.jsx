import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const DentistReport = () => {
   

    const { id } = useParams();
    const localRole = localStorage.getItem('Role');
    const dentistIdFromParams = id || localStorage.getItem('Accountid');

    const BASEURL = import.meta.env.VITE_BASEURL;

    const [dentists, setDentists] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [procedureCounts, setProcedureCounts] = useState({});
    const [income, setIncome] = useState({ today: 0, month: 0, year: 0, summary: 0 });
    const [filter, setFilter] = useState('today');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([...Array(12).keys()].map(i => i + 1));

    const [firstAppointmentId, setFirstAppointmentId] = useState(null);
    const [selectedDentistId, setSelectedDentistId] = useState(() => {
        if (localRole === 'dentist') {
            return dentistIdFromParams || ''; // default to empty string if no dentist ID
        }
        return firstAppointmentId ? firstAppointmentId._id : ''; // default to empty string if no first appointment
    });

    // Fetch list of dentists for dropdown
    useEffect(() => {
        const fetchDentists = async () => {
            try {
                const response = await axios.get(`${BASEURL}/dentist/dentistnames`, { withCredentials: true });
                setDentists(response.data);
            } catch (error) {
                console.error('Error fetching dentists:', error);
            }
        };
        fetchDentists();
    }, []);

    // Fetch appointments based on selected dentist
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get(`${BASEURL}/dentist/appointmentlist/${selectedDentistId}`, { withCredentials: true });

                const appointments = Array.isArray(response.data) ? response.data : [];

                const completedAppointments = appointments
                    .filter(app => app.Status === "Completed")
                    .sort((a, b) => {
                        const nameA = (a.PatientName || "").toLowerCase();
                        const nameB = (b.PatientName || "").toLowerCase();

                        const isAStartingWithDr = nameA.startsWith("dra.") || nameA.startsWith("dr.");
                        const isBStartingWithDr = nameB.startsWith("dra.") || nameB.startsWith("dr.");

                        if (isAStartingWithDr === isBStartingWithDr) {
                            return nameA.localeCompare(nameB);
                        }

                        return isAStartingWithDr ? -1 : 1;
                    });

                setAppointments(completedAppointments);
                setFirstAppointmentId(completedAppointments.length > 0 ? completedAppointments[0].id : null);

                const yearsSet = new Set(
                    completedAppointments
                        .filter(app => app.date)
                        .map(app => new Date(app.date).getFullYear())
                );
                setAvailableYears(Array.from(yearsSet).sort((a, b) => a - b));
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        if (selectedDentistId) {
            fetchAppointments();
        }
    }, [selectedDentistId]);


    // Process report data
    useEffect(() => {
        const processReport = () => {
            let procedureCount = {};
            let todayIncome = 0;
            let monthIncome = 0;
            let yearIncome = 0;
            let summaryIncome = 0;

            const today = new Date();
            const todayDate = today.toISOString().split('T')[0];
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();

            appointments.forEach((appointment) => {
                const appointmentDate = new Date(appointment.date);
                const appointmentYear = appointmentDate.getFullYear();
                const appointmentMonth = appointmentDate.getMonth() + 1;
                const appointmentDateStr = appointmentDate.toISOString().split('T')[0];

                // Determine if appointment matches selected filter
                let isInSelectedRange = false;
                if (filter === 'today' && appointmentDateStr === todayDate) {
                    isInSelectedRange = true;
                    todayIncome += appointment.Amount;
                } else if (filter === 'month' && appointmentYear === selectedYear && appointmentMonth === selectedMonth) {
                    isInSelectedRange = true;
                    monthIncome += appointment.Amount;
                } else if (filter === 'year' && appointmentYear === selectedYear) {
                    isInSelectedRange = true;
                    yearIncome += appointment.Amount;
                } else if (filter === 'summary') {
                    isInSelectedRange = true;
                    summaryIncome += appointment.Amount;
                }

                // Count procedures only if appointment matches filter
                if (isInSelectedRange) {
                    appointment.procedures.forEach((procedure) => {
                        procedureCount[procedure.Procedure_name] = (procedureCount[procedure.Procedure_name] || 0) + 1;
                    });
                }
            });

            setProcedureCounts(procedureCount);
            setIncome({
                today: todayIncome,
                month: monthIncome,
                year: yearIncome,
                summary: summaryIncome
            });
        };

        processReport();
    }, [appointments, filter, selectedYear, selectedMonth]);

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value));
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleDentistChange = (event) => {
        setSelectedDentistId(event.target.value);
    };
    const generatePDF = () => {
        const doc = new jsPDF();

        // Set a formal font (Times for a more professional look)
        doc.setFont("times", "normal");

        // Title - larger size, centered, formal style
        doc.setFontSize(20);
        doc.setTextColor(62, 180, 137); // Custom color #3EB489
        doc.text("Dentist Report", doc.internal.pageSize.width / 2, 20, { align: 'center' });

        // Add space after the title
        let lineHeight = 30;

        // Filter Section (Smaller, normal font)
        doc.setFontSize(12);
        doc.setTextColor(100); // Lighter gray for filter section
        doc.text(`Filter: ${filter}`, 14, lineHeight);
        lineHeight += 10;

        // Dentist Information
        doc.setTextColor(0, 0, 0); // Reset color for dentist name
        doc.text(`Dentist: ${dentists.find(dentist => dentist._id === selectedDentistId)?.FirstName} ${dentists.find(dentist => dentist._id === selectedDentistId)?.LastName}`, 14, lineHeight);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, lineHeight + 10);
        lineHeight += 30;

        // Income Section (formatted with a bit more structure)
        doc.setFontSize(12);
        switch (filter) {
            case 'today':
                doc.text(`Today's Income: ₱${income.today.toLocaleString()}`, 14, lineHeight);
                break;
            case 'month':
                doc.text(`Month Income (${selectedMonth}/${selectedYear}): ₱${income.month.toLocaleString()}`, 14, lineHeight);
                break;
            case 'year':
                doc.text(`Year Income (${selectedYear}): ₱${income.year.toLocaleString()}`, 14, lineHeight);
                break;
            case 'summary':
                doc.text(`Total Income: ₱${income.summary.toLocaleString()}`, 14, lineHeight);
                break;
            default:
                break;
        }

        lineHeight += 15;

        // Procedural Section Header - bold and custom color
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.setTextColor(62, 180, 137); // Custom color #3EB489
        doc.text("Procedures Done:", 14, lineHeight);
        doc.setFont("times", "normal");
        doc.setTextColor(0, 0, 0); // Reset color for the procedure list
        lineHeight += 15;

        // Procedure Counts
        Object.entries(procedureCounts).forEach(([name, count]) => {
            doc.text(`${name}: ${count}`, 14, lineHeight);
            lineHeight += 10;
        });

        // Add a simple horizontal line to divide sections
        doc.setLineWidth(0.5);
        doc.setDrawColor(62, 180, 137); // Line in the same custom color #3EB489
        doc.line(14, lineHeight + 5, doc.internal.pageSize.width - 14, lineHeight + 5);
        lineHeight += 15;

        // Footer with page number (right-aligned, smaller font)
        doc.setFontSize(10);
        doc.setTextColor(100); // Lighter gray for footer
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);

        // Save the PDF with a descriptive filename
        doc.save(`Dentist_Report_${filter}_${selectedDentistId}.pdf`);
    };
    return (
        <div className="p-8 min-h-screen">
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-[#3EB489]">Dentist Report</h2>

                {/* Dentist Selection Dropdown */}
                {localRole !== 'dentist' && (
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Select Dentist:</label>
                        <select
                            value={selectedDentistId}
                            onChange={handleDentistChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-[#3EB489] focus:ring-[#3EB489]"
                        >
                            {/* <option value="">-- Select Dentist --</option> */}
                            {dentists.map(dentist => (
                                <option key={dentist._id} value={dentist._id}>
                                    {dentist.FirstName} {dentist.MiddleName} {dentist.LastName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Filter Options */}
                <div className="mb-6">
                    <h3 className="font-semibold text-xl mb-4 text-gray-700">Filter by:</h3>
                    <div className="flex gap-6">
                        {['today', 'month', 'year', 'summary'].map((value) => (
                            <label key={value} className="inline-flex items-center gap-2 text-[#3EB489] font-medium">
                                <input
                                    type="radio"
                                    value={value}
                                    checked={filter === value}
                                    onChange={handleFilterChange}
                                    className="text-[#3EB489] focus:ring-[#3EB489]"
                                />
                                <span className="capitalize">{value}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {localStorage.getItem('Role') !== 'dentist' && (
                    <div className="mt-6">
                        <button
                            onClick={generatePDF}
                            className="py-2 px-4 bg-[#3EB489] text-white rounded-md font-semibold"
                        >
                            Download Report as PDF
                        </button>
                    </div>

                )}
                {/* Additional filter options for month/year */}
                {filter === 'month' && (
                    <div className="flex gap-4 mb-6">
                        <div>
                            <label className="block text-gray-700 font-medium">Year:</label>
                            <select
                                value={selectedYear}
                                onChange={handleYearChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#3EB489] focus:ring-[#3EB489]"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Month:</label>
                            <select
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#3EB489] focus:ring-[#3EB489]"
                            >
                                {availableMonths.map(month => (
                                    <option key={month} value={month}>
                                        {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {filter === 'year' && (
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium">Year:</label>
                        <select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#3EB489] focus:ring-[#3EB489]"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Procedures and Income Sections */}
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-[#3EB489]">Procedures Done</h3>
                    {Object.keys(procedureCounts).length > 0 ? (
                        <ul className="list-disc list-inside mt-3 text-gray-700">
                            {Object.entries(procedureCounts).map(([name, count]) => (
                                <li key={name} className="font-medium">{name}: {count}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 mt-3">No procedures recorded.</p>
                    )}
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-[#3EB489]">Income</h3>
                    <p className="text-gray-700 font-medium mt-3">
                        {filter === 'today' && `Today: ₱${income.today.toLocaleString()}`}
                        {filter === 'month' && `This Month: ₱${income.month.toLocaleString()}`}
                        {filter === 'year' && `This Year: ₱${income.year.toLocaleString()}`}
                        {filter === 'summary' && `Total Income: ₱${income.summary.toLocaleString()}`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DentistReport;
