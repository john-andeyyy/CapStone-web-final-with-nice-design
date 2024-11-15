import React, { useState, useEffect } from 'react';
import axios from 'axios';
const BASEURL = import.meta.env.VITE_BASEURL;

export default function AddTreatmentPlan({ patientId, onAdd, onCancel }) {
    const [newPlan, setNewPlan] = useState({
        patient: patientId,
        TreatmentStage: '',
        ProcedureList: [{ Procedure: '' }],
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
            const proc = procedures.find(p => p._id === procedure.Procedure);
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
                onCancel();
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
        updatedProcedures[index] = { Procedure: selectedProcedure ? selectedProcedure._id : '' };
        setNewPlan((prev) => ({
            ...prev,
            ProcedureList: updatedProcedures,
        }));
    };

    const addProcedureField = () => {
        setNewPlan((prev) => ({
            ...prev,
            ProcedureList: [...prev.ProcedureList, { Procedure: '' }],
        }));
    };

    const selectedProcedureIds = newPlan.ProcedureList.map(proc => proc.Procedure);

    return (
        <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-[#00000] text-center">Add Treatment Plan</h2>

            {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
            {successMessage && <div className="text-black mb-4 text-center text-xl font-bold">{successMessage}</div>}

        <div className='grid grid-cols-2'>
           
            <div className="mb-4 mr-4">
                <label className="block text-black">Treatment Stage</label>
                <input
                    type="text"
                    name="TreatmentStage"
                    value={newPlan.TreatmentStage}
                    onChange={handleChange}
                    className="bg-gray-100 border rounded w-full py-2 px-3 shadow-md"
                    required
                />
            </div>

            {newPlan.ProcedureList.map((procedure, index) => (
                <div key={index} className="mb-4">
                    <label className="block text-black">Procedure</label>
                    <select
                        value={procedure.Procedure ? procedures.find(proc => proc._id === procedure.Procedure)?.Procedure_name : ''}
                        onChange={(e) => handleProcedureChange(e, index)}
                        className="bg-gray-100 border rounded w-full py-2 px-3 shadow-md"
                        required
                    >
                        <option value="">Select a procedure</option>
                        {procedures.map((proc) => (
                            <option key={proc._id} value={proc.Procedure_name} disabled={selectedProcedureIds.includes(proc._id) && procedure.Procedure !== proc._id}>
                                {proc.Procedure_name}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
            <div>
                <button onClick={addProcedureField} className="bg-[#025373] text-white py-2 px-4 rounded hover:bg-[#03738C] mb-4">
                    Add Procedure
                </button>
            </div>
        
        </div>

            <div className='grid grid-cols-2 gap-4'>
                <div className="mb-4">
                    <label className="block text-black" htmlFor="EstimatedCost">Estimated Cost</label>
                    <input
                        type="number"
                        id="EstimatedCost"
                        name="EstimatedCost"
                        value={newPlan.EstimatedCost}
                        onChange={handleChange}
                        className="bg-gray-100 border rounded w-full py-2 px-3 shadow-md"
                        required
                        min="0"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-black" htmlFor="scheduleOn">Set Recomended Schedule</label>
                    <input
                        type="date"
                        id="scheduleOn"
                        name="scheduleOn"
                        value={newPlan.scheduleOn ? newPlan.scheduleOn.split('T')[0] : ''}
                        onChange={handleChange}
                        className="bg-gray-100 border rounded w-full py-2 px-3 shadow-md"
                        required
                    />
                </div>
            </div>

            <div className="mt-auto flex justify-end space-x-2">
                <button onClick={handleAddPlan} className="bg-[#025373] hover:bg-[#03738C] text-white py-2 px-4 rounded">
                    Add Plan
                </button>
                <button
                    onClick={onCancel}
                    className="text-white py-2 px-4 rounded bg-[#ADAAAA] hover:bg-[#D9D9D9]"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
