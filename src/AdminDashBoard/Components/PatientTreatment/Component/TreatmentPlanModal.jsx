import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddTreatmentPlan from './AddTreatmentPlan';
import EditTreatmentPlan from './EditTreatmentPlan';

const BASEURL = import.meta.env.VITE_BASEURL;

const TreatmentPlanModal = ({ patientId, isOpen, onClose }) => {
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [noRecords, setNoRecords] = useState(false); // State for no records

    useEffect(() => {
        if (isOpen) {
            const fetchTreatmentPlans = async () => {
                try {
                    const response = await axios.get(`${BASEURL}/treatmentplan/treatmentplans/patient/${patientId}`);
                    if (response.status === 200) {
                        setTreatmentPlans(response.data.reverse());
                        setNoRecords(false); // Reset no records state
                    } else if (response.status === 404) {
                        setNoRecords(true); // Set no records state
                        setTreatmentPlans([]); // Clear treatment plans
                    }
                } catch (error) {
                    // console.error("Error fetching treatment plans:", error);
                    setNoRecords(true); // Set no records state on error
                    setTreatmentPlans([]); // Clear treatment plans
                }
            };

            fetchTreatmentPlans();
        }
    }, [isOpen, patientId]);

    const updateStatus = async (planId, nextStatus) => {
        try {
            await axios.put(`${BASEURL}/treatmentplan/status/${planId}`, { Status: nextStatus });
            const response = await axios.get(`${BASEURL}/treatmentplan/treatmentplans/patient/${patientId}`);
            setTreatmentPlans(response.data.reverse());
            setNoRecords(false); // Reset no records state after updating
        } catch (error) {
            console.error("Error updating treatment plan status:", error);
        }
    };

    const handleEditClick = (plan) => {
        setCurrentPlan(plan);
        setIsEditing(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="rounded-lg shadow-lg p-6 w-11/12 max-w-5xl bg-[#C6E4DA]">
                {/* <h2 className="text-2xl font-bold mb-6 text-[#C6E4DA] text-center">
                    {isAdding ? 'Add Treatment Plan' : isEditing ? 'Edit Treatment Plan' : `Treatment Plans for ${treatmentPlans.length > 0 ? `${treatmentPlans[0].patient.FirstName} ${treatmentPlans[0].patient.LastName}` : 'N/A'}`}
                </h2> */}

                <h2 className="text-2xl font-bold mb-6 text-[#266D53] text-center">
                    Treatment Plan
                </h2>

                <div>
                    {isAdding ? (
                        <AddTreatmentPlan
                            patientId={patientId}
                            onAdd={() => {
                                const fetchTreatmentPlans = async () => {
                                    try {
                                        const response = await axios.get(`${BASEURL}/treatmentplan/treatmentplans/patient/${patientId}`);
                                        setTreatmentPlans(response.data.reverse());
                                        setNoRecords(false); // Reset no records state after adding
                                    } catch (error) {
                                        console.error("Error fetching treatment plans:", error);
                                        setNoRecords(true); // Set no records state on error
                                    }
                                };
                                fetchTreatmentPlans();
                            }}
                            onCancel={() => setIsAdding(false)}
                        />
                    ) : isEditing && currentPlan ? (
                        <EditTreatmentPlan
                            plan={currentPlan}
                            onSave={(updatedPlan) => {
                                const fetchTreatmentPlans = async () => {
                                    try {
                                        const response = await axios.get(`${BASEURL}/treatmentplan/treatmentplans/patient/${patientId}`);
                                        setTreatmentPlans(response.data.reverse());
                                        setNoRecords(false); // Reset no records state after saving
                                    } catch (error) {
                                        console.error("Error fetching treatment plans:", error);
                                        setNoRecords(true); // Set no records state on error
                                    }
                                };
                                fetchTreatmentPlans();
                                setIsEditing(false);
                                setCurrentPlan(null);
                            }}
                            onCancel={() => {
                                setIsEditing(false);
                                setCurrentPlan(null);
                            }}
                        />
                    ) : (
                        <div>
                            {noRecords ? (
                                <p className="text-center text-red-500">No treatment plans found.</p> // Display no records message
                            ) : (
                                <div className='max-h-96 overflow-y-auto'>
                                    <table className="min-w-full border border-black bg-gray-100 text-white">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="py-2 px-4 border border-black bg-[#3EB489]">Treatment Stage</th>
                                                <th className="py-2 px-4 border border-black bg-[#3EB489]">Procedure</th>
                                                <th className="py-2 px-4 border border-black bg-[#3EB489]">Estimated Cost</th>
                                                <th className="py-2 px-4 border border-black bg-[#3EB489]">Date</th>
                                                <th className="py-2 px-4 border border-black bg-[#3EB489]">Status</th>
                                                <th className="py-2 px-4 border border-black bg-[#3EB489]">Update Status</th>
                                                <th className="py-2 px-4 border border-black bg-[#3EB489]">Edit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {treatmentPlans.map((plan) => (
                                                <tr key={plan._id} className={plan.Status === 'Completed' ? 'bg-green-200 bg-opacity-50' : ''}>
                                                    <td className="py-2 px-4 border border-black bg-gray-100 text-black">{plan.TreatmentStage}</td>
                                                    <td className="py-2 px-4 border border-black bg-gray-100 text-black">{plan.ProcedureList.map((item) => item.Procedure.Procedure_name).join(', ')}</td>
                                                    <td className="py-2 px-4 border border-black bg-gray-100 text-black">{plan.EstimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}</td>
                                                    <td className="py-2 px-4 border border-black bg-gray-100 text-black">{new Date(plan.scheduleOn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</td>
                                                    <td className="py-2 px-4 border border-black bg-gray-100 text-black">{plan.Status}</td>
                                                    <td className="py-2 px-4 border border-black bg-gray-100 text-black">
                                                        {plan.Status === 'Completed' ? (
                                                            <span className="text-green-700 font-semibold">Completed</span>
                                                        ) : (
                                                            <div className="flex space-x-2">
                                                                {plan.Status === 'Pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => updateStatus(plan._id, 'Completed')}
                                                                            className="py-1 px-3 text-sm rounded text-white bg-[#4285F4] hover:bg-[#0C65F8]"
                                                                        >
                                                                            Completed
                                                                        </button>
                                                                        <button
                                                                            onClick={() => updateStatus(plan._id, 'Missed')}
                                                                            className="py-1 px-3 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                                                                        >
                                                                            Missed
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border border-black bg-gray-100 text-black">
                                                        <button
                                                            onClick={() => handleEditClick(plan)}
                                                            className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className=" text-black py-2 px-4 rounded bg-[#4285F4] hover:bg-[#0C65F8]"
                                >
                                    Add Treatment Plan
                                </button>
                                <button
                                    onClick={onClose}
                                    className=" text-black py-2 px-4 rounded bg-[#D9D9D9] hover:bg-[#ADAAAA] ml-2"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreatmentPlanModal;
