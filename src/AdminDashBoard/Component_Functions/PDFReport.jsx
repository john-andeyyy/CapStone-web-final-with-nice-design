import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import the autoTable function


const PDFReport = ({ appointments, month, title }) => {
    // Calculate completed and missed counts
    const completedCount = appointments.filter(appointment => appointment.status === 'Completed').length;
    const missedCount = appointments.filter(appointment => appointment.status === 'Missed').length;

    const saveAsPDF = () => {
        const doc = new jsPDF();
        const themeColor = "#3EB489"; // Consistent theme color
        const rowHeight = 10; // Row height for tables

        // Title Section
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0); // Black text for title
        doc.text(title || 'Total Appointments Report', 14, 16);

        const formattedMonth = month === new Date().toISOString().slice(0, 7) ? "Current Month" : month;
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Month: ${formattedMonth}`, 14, 24);
        doc.setLineWidth(0.5);
        doc.line(14, 26, 196, 26);

        // Display counts of completed and missed appointments
        let yPosition = 30; // Initial Y position for text
        if (completedCount > 0) {
            doc.text(`Completed Appointments: ${completedCount}`, 14, yPosition);
            yPosition += 10; // Increment Y position for the next text
        }

        if (missedCount > 0) {
            doc.text(`Missed Appointments: ${missedCount}`, 14, yPosition);
            yPosition += 10; // Increment Y position for the next text
        }

        // Prepare data for the table
        const data = appointments.map(appointment => [
            `${appointment.patient.LastName} ${appointment.patient.FirstName}`,
            appointment.status,
            new Date(appointment.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        ]);

        // Generate the table
        autoTable(doc, {
            startY: yPosition + 10, // Start below the counts
            head: [['Patient Name', 'Status', 'Date']],
            body: data,
            theme: 'grid',
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 12,
            },
            bodyStyles: {
                fontSize: 10,
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240],
            },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
            margin: { top: 10 },
        });

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }

        // Save the PDF
        doc.save(`${title || 'Monthly_Appointments_Report'}.pdf`);
    };

    return (
        <div>
            <button
                onClick={saveAsPDF}
                className="px-4 py-2 bg-[#3EB489] hover:bg-[#62A78E] text-white rounded transition duration-200"
            >
                Generate PDF
            </button>
        </div>
    );
};



const PDFPatientVisit = ({ appointments, title }) => {
    const generatePDF = () => {
        const doc = new jsPDF();
        const themeColor = "#3EB489"; // Consistent theme color

        // Add title
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0); // Black text for the title
        doc.text(title || 'Patient Visits Report', 14, 20); // Default title if none provided

        // Define columns for the table
        const columns = [
            { header: 'ID', dataKey: 'id' },
            { header: 'Name', dataKey: 'name' },
            { header: 'Last Visit', dataKey: 'lastVisit' },
            { header: 'Visit (Month Year)', dataKey: 'monthYear' },
            { header: 'Total Visits', dataKey: 'totalVisits' },
        ];

        // Create rows from the appointments data
        const rows = appointments.map(appointment => ({
            id: appointment.id,
            name: appointment.name,
            lastVisit: appointment.lastVisit,
            monthYear: appointment.monthYear,
            totalVisits: appointment.totalVisits,
        }));

        // Check if rows have data
        if (rows.length === 0) {
            doc.setFontSize(12);
            doc.setTextColor(100); // Gray text for "No data available"
            doc.text('No data available', 14, 40);
        } else {
            // Add the table to the PDF
            autoTable(doc, {
                columns,
                body: rows,
                startY: 30, // Positioning below the title
                theme: 'grid',
                headStyles: {
                    fillColor: [22, 160, 133], // Header background color
                    textColor: [255, 255, 255], // Header text color
                    fontStyle: 'bold',
                    fontSize: 12,
                },
                bodyStyles: {
                    fontSize: 10,
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240], // Alternate row color for better readability
                },
                tableLineColor: [0, 0, 0], // Table border color
                tableLineWidth: 0.1, // Table border width
            });
        }

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }

        // Save the PDF
        doc.save(`${title || 'Patient_Visits_Report'}.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            className="px-4 py-2 bg-[#3EB489] hover:bg-[#62A78E] text-white rounded transition duration-200"
        >
            Generate PDF
        </button>
    );
};




// Export components
export { PDFReport, PDFPatientVisit };
