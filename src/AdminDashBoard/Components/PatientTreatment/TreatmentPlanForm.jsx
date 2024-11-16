import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TreatmentPlanForm = ({ treatmentPlanId }) => {
    const [patient, setPatient] = useState('');
    const [treatmentStage, setTreatmentStage] = useState('Initial');
    const [procedureList, setProcedureList] = useState([{ Procedure: '66d6c49b0cb91bf3b8c15a53' }]);
    const [estimatedCost, setEstimatedCost] = useState(1200);
    const [status, setStatus] = useState('Pending');
    const [scheduleOn, setScheduleOn] = useState('2024-11-05T09:00:00.000Z');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // If a treatmentPlanId is provided, fetch the treatment plan details for editing
        if (treatmentPlanId) {
            axios.get(`{{local}}/treatmentplan/treatmentplans/${treatmentPlanId}`)
                .then(response => {
                    const { data } = response;
                    setPatient(data.patient);
                    setTreatmentStage(data.TreatmentStage);
                    setProcedureList(data.ProcedureList);
                    setEstimatedCost(data.EstimatedCost);
                    setStatus(data.Status);
                    setScheduleOn(data.scheduleOn);
                    setIsEditing(true);
                })
                .catch(error => {
                    console.error('Error fetching treatment plan:', error);
                });
        }
    }, [treatmentPlanId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const treatmentPlanData = {
            patient,
            TreatmentStage: treatmentStage,
            ProcedureList: procedureList,
            EstimatedCost: estimatedCost,
            Status: status,
            scheduleOn,
        };

        if (isEditing) {
            // Update existing treatment plan
            axios.put(`{{local}}/treatmentplan/treatmentplans/${treatmentPlanId}`, treatmentPlanData)
                .then(response => {
                    console.log('Treatment plan updated:', response.data);
                    // Handle success (e.g., show a success message or redirect)
                })
                .catch(error => {
                    console.error('Error updating treatment plan:', error);
                });
        } else {
            // Create a new treatment plan
            axios.post(`{{local}}/treatmentplan/treatmentplans`, treatmentPlanData)
                .then(response => {
                    console.log('Treatment plan created:', response.data);
                    // Handle success (e.g., show a success message or redirect)
                })
                .catch(error => {
                    console.error('Error creating treatment plan:', error);
                });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{isEditing ? 'Edit Treatment Plan' : 'Create Treatment Plan'}</h2>

            <div>
                <label>Patient:</label>
                <input
                    type="text"
                    value={patient}
                    onChange={(e) => setPatient(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Treatment Stage:</label>
                <input
                    type="text"
                    value={treatmentStage}
                    onChange={(e) => setTreatmentStage(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Procedure List:</label>
                {procedureList.map((proc, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            value={proc.Procedure}
                            onChange={(e) => {
                                const newProcedureList = [...procedureList];
                                newProcedureList[index].Procedure = e.target.value;
                                setProcedureList(newProcedureList);
                            }}
                            required
                        />
                    </div>
                ))}
            </div>

            <div>
                <label>Estimated Cost:</label>
                <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Status:</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Not Started">Not Started</option>
                </select>
            </div>

            <div>
                <label>Schedule On:</label>
                <input
                    type="datetime-local"
                    value={scheduleOn.substring(0, 16)} // Format for datetime-local input
                    onChange={(e) => setScheduleOn(e.target.value + ':00Z')}
                    required
                />
            </div>

            <button type="submit">{isEditing ? 'Update' : 'Create'} Treatment Plan</button>
        </form>
    );
};

export default TreatmentPlanForm;
