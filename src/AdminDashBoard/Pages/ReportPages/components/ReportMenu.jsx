import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ReportMenu() {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedReport, setSelectedReport] = useState('/IncomeReport'); 

    useEffect(() => {
        setSelectedReport(location.pathname); 
    }, [location.pathname]);

    const handleNavigation = (path) => {
        setSelectedReport(path); 
        if (path) navigate(path); 
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className=" items-center ml-2 mb-4 mt-4">
                <label htmlFor="report-selector" className="block font-semibold mr-4">
                    Select Reports:
                </label>

                <select
                    id="report-selector"
                    value={selectedReport} // Bind to state
                    onChange={(e) => handleNavigation(e.target.value)} // Handle changes
                    className="block p-2 border border-gray-400 rounded-md focus:outline-none transition max-w-xs"
                >
                    
                    <option value="/Total_procedures">Procedure Summary</option>
                    <option value="/Report_Monthly_Appointment">Appointment Summary</option>
                    <option value="/Patient_Visits">Patient Visits Summary</option>
                    <option value="/IncomeReport">Income Report Summary</option>
                    <option value="/Patient_Procedures_done">Patient Procedures Done</option>
                    <option value="/DentistReport">DentistReport</option>
                </select>
            </div>
        </div>
    );
}
