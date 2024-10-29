import React, { useState, useEffect } from 'react';
import axios from 'axios';
const BASEURL = import.meta.env.VITE_BASEURL;

export default function AddTreatmentPlan({ patientId, onAdd, onCancel }) {
    const [newPlan, setNewPlan] = useState({
        patient: patientId,
        TreatmentStage: '',
        ProcedureList: [{ Procedure: '' }], // Initially set to empty string
        EstimatedCost: 0,
        Status: 'Pending',
        scheduleOn: '',
    });
    const [procedures, setProcedures] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProcedures = async () => {
            try {
                const response = await axios.get(`${BASEURL}/Procedure/names`);
                setProcedures(response.data);
            } catch (error) {
                console.error("Error fetching procedures:", error);
            }
        };

        fetchProcedures();
    }, []);

    useEffect(() => {
        // Calculate total Estimated Cost
        const totalCost = newPlan.ProcedureList.reduce((total, procedure) => {
            const proc = procedures.find(p => p._id === procedure.Procedure); // Match by ID
            return proc ? total + proc.Price : total;
        }, 0);
        setNewPlan(prev => ({ ...prev, EstimatedCost: totalCost }));
    }, [newPlan.ProcedureList, procedures]);

    const validateForm = () => {
        const { TreatmentStage, ProcedureList, EstimatedCost, scheduleOn } = newPlan;
        return TreatmentStage && ProcedureList.every(proc => proc.Procedure) && EstimatedCost > 0 && scheduleOn;
    };

    const handleAddPlan = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (!validateForm()) {
            setErrorMessage("Please fill all required fields.");
            return;
        }

        try {
            const response = await axios.post(`${BASEURL}/treatmentplan/treatmentplans`, newPlan);
            if (response.status === 201) {
                onAdd();
                setSuccessMessage("Treatment plan added successfully!");
                setNewPlan({
                    patient: patientId,
                    TreatmentStage: '',
                    ProcedureList: [{ Procedure: '' }],
                    EstimatedCost: 0,
                    Status: 'Pending',
                    scheduleOn: ''
                });
            }
        } catch (error) {
            console.error("Error adding treatment plan:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPlan((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProcedureChange = (e, index) => {
        const { value } = e.target;
        const updatedProcedures = [...newPlan.ProcedureList];
        const selectedProcedure = procedures.find(proc => proc.Procedure_name === value);
        updatedProcedures[index] = { Procedure: selectedProcedure ? selectedProcedure._id : '' }; // Store the ID
        setNewPlan((prev) => ({
            ...prev,
            ProcedureList: updatedProcedures,
        }));
    };

    const addProcedureField = () => {
        setNewPlan((prev) => ({
            ...prev,
            ProcedureList: [...prev.ProcedureList, { Procedure: '' }], // Add new empty procedure field
        }));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-[#C6E4DA] text-center">
                Add Treatment Plan
            </h2>

            {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
            {successMessage && <div className="text-black mb-4 text-center text-xl font-bold">{successMessage}</div>}

            <div className="mb-4">
                <label className="block text-gray-700">Treatment Stage</label>
                <input
                    type="text"
                    name="TreatmentStage"
                    value={newPlan.TreatmentStage}
                    onChange={handleChange}
                    className="border rounded w-full py-2 px-3"
                    required
                />
            </div>

            {newPlan.ProcedureList.map((procedure, index) => (
                <div key={index} className="mb-4">
                    <label className="block text-gray-700">Procedure</label>
                    <select
                        value={procedure.Procedure ? procedures.find(proc => proc._id === procedure.Procedure)?.Procedure_name : ''}
                        onChange={(e) => handleProcedureChange(e, index)}
                        className="border rounded w-full py-2 px-3"
                        required
                    >
                        <option value="">Select a procedure</option>
                        {procedures.map((proc) => (
                            <option key={proc._id} value={proc.Procedure_name}>{proc.Procedure_name}</option>
                        ))}
                    </select>
                </div>
            ))}
            {/* <button onClick={addProcedureField} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4">
                Add Procedure
            </button> */}

            <div className="mb-4">
                <label className="block text-gray-700">Estimated Cost</label>
                <input
                    type="number"
                    name="EstimatedCost"
                    value={newPlan.EstimatedCost}
                    onChange={handleChange}
                    className="border rounded w-full py-2 px-3"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Schedule On</label>
                <input
                    type="date"
                    name="scheduleOn"
                    value={newPlan.scheduleOn.split('T')[0]}
                    onChange={handleChange}
                    className="border rounded w-full py-2 px-3"
                    required
                />
            </div>

            <div className="mt-4 flex justify-end">
                <button onClick={handleAddPlan} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                    Add Plan
                </button>
                <button
                    onClick={onCancel}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 ml-2"
                >
                    Cancel/back
                </button>
            </div>
        </div>
    );
}
