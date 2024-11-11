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
        <div className="rounded-md" style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
    <div className="bg-gray-100 rounded-md p-4 sm:p-6">
        <div className="mb-6 mt-10">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <h2 className="text-3xl font-bold text-[#3EB489] text-center sm:text-left">Dentist Report</h2>
                <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700">Filter by:</label>
                    <select
                        value={filter}
                        onChange={handleFilterChange}
                        className="block p-2 border border-gray-400 rounded-md focus:outline-none transition w-full sm:w-auto max-w-xs"
                    >
                        <option value="today" className="capitalize">Today</option>
                        <option value="month" className="capitalize">Month</option>
                        <option value="year" className="capitalize">Year</option>
                        <option value="summary" className="capitalize">Summary</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Dentist Selection Dropdown */}
        {localRole !== 'dentist' && (
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="flex flex-col items-start w-full sm:w-auto space-y-2">
                <span className="text-sm sm:text-base text-black">Select Dentist:</span>
                <select
                    value={selectedDentistId}
                    onChange={handleDentistChange}
                    className="block w-full sm:w-auto p-2 border-gray-300 rounded-md shadow-sm focus:border-[#3EB489] focus:ring-[#3EB489]"
                >
                    {dentists.map(dentist => (
                        <option key={dentist._id} value={dentist._id}>
                            {dentist.FirstName} {dentist.MiddleName} {dentist.LastName}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="flex justify-end w-full sm:w-auto sm:ml-auto">
                <button
                    onClick={generatePDF}
                    className="py-2 px-4 bg-[#3EB489] text-white rounded-md font-semibold w-full sm:w-auto"
                >
                    Generate PDF
                </button>
            </div>
        </div>
        
        )}

        {/* Filter Options */}
        <div className="mb-6">
            {filter === 'month' && (
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4">
                    <div className="w-full sm:w-auto">
                        <label className="block text-gray-700 font-medium">Month:</label>
                        <select
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="mt-1 block w-full sm:w-auto p-2 border-gray-300 rounded-md shadow-sm focus:border-[#3EB489] focus:ring-[#3EB489]"
                        >
                            {availableMonths.map(month => (
                                <option key={month} value={month}>
                                    {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-gray-700 font-medium">Year:</label>
                        <select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="mt-1 block w-full sm:w-auto p-2 border-gray-300 rounded-md shadow-sm focus:border-[#3EB489] focus:ring-[#3EB489]"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {filter === 'year' && (
                <div className="flex justify-end mt-4">
                    <div className="w-full sm:w-auto">
                        <label className="block text-gray-700 font-medium">Year:</label>
                        <select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="mt-1 block w-full sm:w-auto p-2 border-gray-300 rounded-md shadow-sm focus:border-[#3EB489] focus:ring-[#3EB489]"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>

        {/* Procedures and Income Sections */}
        <div className="mt-10 p-4">
            <h3 className="text-xl font-semibold text-center sm:text-left">Completed Procedures</h3>
            {Object.keys(procedureCounts).length > 0 ? (
                <table className="min-w-full mt-3 table-auto border-collapse">
                    <thead className="bg-[#3EB489] text-white text-center">
                        <tr>
                            <th className="px-4 py-2 font-semibold border border-black">Procedure Name</th>
                            <th className="px-4 py-2 font-semibold border border-black">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(procedureCounts).map(([name, count]) => (
                            <tr key={name}>
                                <td className="px-4 py-2 border border-black">{name}</td>
                                <td className="px-4 py-2 border border-black">{count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-500 mt-3 text-center">No procedures recorded.</p>
            )}
        </div>

        <div className="mt-8 p-4">
            <h3 className="text-xl font-semibold text-center sm:text-left">Income</h3>
            <p className="text-gray-700 font-medium text-center mt-3">
                {filter === 'today' && `Today: PHP ${income.today.toLocaleString()}`}
                {filter === 'month' && `This Month: PHP ${income.month.toLocaleString()}`}
                {filter === 'year' && `This Year: PHP ${income.year.toLocaleString()}`}
                {filter === 'summary' && `Total Income: PHP ${income.summary.toLocaleString()}`}
            </p>
        </div>
    </div>
</div>

    );
};

export default DentistReport;
