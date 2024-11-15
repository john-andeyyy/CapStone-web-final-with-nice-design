import React, { useState } from 'react';
import axios from 'axios';

const BASEURL = import.meta.env.VITE_BASEURL;

const EditTreatmentPlan = ({ plan, onSave, onCancel }) => {
    const [treatmentStage, setTreatmentStage] = useState(plan.TreatmentStage || '');
    const [estimatedCost, setEstimatedCost] = useState(plan.EstimatedCost || 0);
    const [status, setStatus] = useState(plan.Status || 'Pending');
    const [scheduleOn, setScheduleOn] = useState(plan.scheduleOn || '');

    const handleSave = async () => {
        try {
            const updatedPlan = {
                TreatmentStage: treatmentStage,
                EstimatedCost: estimatedCost,
                Status: status,
                scheduleOn: scheduleOn,
                ProcedureList: plan.ProcedureList // Assuming procedures are unedited here
            };
            await axios.put(`${BASEURL}/treatmentplan/treatmentplans/${plan._id}`, updatedPlan);
            onSave(updatedPlan); // Callback to update parent state
        } catch (error) {
            console.error("Error updating treatment plan:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="modal-box  flex flex-col relative p-5  bg-[#ffffff]  ">
        {/* <div className="p-4  bg-[#C6E4DA]  rounded shadow-lg"> */}
            <h3 className="text-2xl text-[#00000] text-center font-bold mb-10">Edit Treatment Plan</h3>
            <div className='grid grid-cols-2 gap-4'>
                <div className="mb-4">
                    <label className="block font-semibold">Treatment Stage</label>
                    <input
                        type="text"
                        value={treatmentStage}
                        onChange={(e) => setTreatmentStage(e.target.value)}
                        className="bg-gray-100 shadow-md w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-semibold">Estimated Cost</label>
                    <input
                        type="number"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(Number(e.target.value))}
                        className="bg-gray-100 shadow-md w-full p-2 border rounded"
                    />
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <div className="mb-4">
                    <label className="block font-semibold">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-gray-100 shadow-md w-full p-2 border rounded"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Missed">Missed</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block font-semibold">Schedule Date</label>
                    <input
                        type="date"
                        value={new Date(scheduleOn).toISOString().split('T')[0]}
                        onChange={(e) => setScheduleOn(new Date(e.target.value).toISOString())}
                        className="bg-gray-100 shadow-md w-full p-2 border rounded"
                    />
                </div>
            </div>
            <div className="flex justify-center items-center">
                <button
                    onClick={handleSave}
                    className="bg-[#025373] hover:bg-[#03738C] text-white py-2 px-4 rounded mr-2"
                >
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white py-2 px-4 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
        </div>
        // </div>
    );
};

export default EditTreatmentPlan;
