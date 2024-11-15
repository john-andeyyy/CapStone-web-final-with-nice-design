import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProceduresModal from './ProceduresModal';
import Swal from 'sweetalert2';

const ProceduresTable = ({ appointment }) => {
    const calculateTotal = () => {
        const existingTotal = userProceduresList.reduce((total, proc) => total + proc.Price, 0);
        const addedTotal = addedProcedures.reduce((total, proc) => total + proc.Price, 0);
        return existingTotal + addedTotal;
    };
    const [userProceduresList, setUserProceduresList] = useState(appointment.procedures || []);
    const [allProcedures, setAllProcedures] = useState([]);
    const [addedProcedures, setAddedProcedures] = useState([]);
    const [markedForRemoval, setMarkedForRemoval] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedAmount, setEditedAmount] = useState(appointment.Amount || 0);
    const [totalAmount, setTotalAmount] = useState(calculateTotal());

    const fetchAllProcedures = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASEURL}/Procedure/show`, { withCredentials: true });
            setAllProcedures(response.data);
        } catch (error) {
            console.error('Error fetching procedures:', error);
        }
    };

    useEffect(() => {
        fetchAllProcedures();
    }, []);

    useEffect(() => {
        setUserProceduresList(appointment.procedures || []);
        setEditedAmount(appointment.Amount || 0);
    }, [appointment]);

    useEffect(() => {
        setTotalAmount(calculateTotal());
    }, [userProceduresList, addedProcedures, markedForRemoval]);

    const handleMarkForRemoval = (id) => {
        setMarkedForRemoval((prev) => [...prev, id]);
    };

    const handleRemoveProcedure = (id) => {
        setAddedProcedures((prev) => prev.filter((proc) => proc._id !== id));
        setMarkedForRemoval((prev) => prev.filter((procId) => procId !== id));
    };

    const handleSaveProcedures = async () => {
        try {
            const finalProcedures = [
                ...userProceduresList,
                ...addedProcedures
            ].filter((proc) => !markedForRemoval.includes(proc._id));

            await axios.put(
                `${import.meta.env.VITE_BASEURL}/Appointments/appointmentUpdate/${appointment._id}`,
                { procedureIds: finalProcedures.map((proc) => proc._id), Amount: calculateTotal() },
                { withCredentials: true }
            );

            setUserProceduresList(finalProcedures);
            setAddedProcedures([]);
            setMarkedForRemoval([]);
            console.log('Procedures saved successfully');

            // SweetAlert success notification
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Procedures saved successfully.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error('Error saving procedures:', error);

            // SweetAlert error notification
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred while saving procedures. Please try again.',
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    };



    const handleSelectProcedures = (selectedProcedures) => {
        const newProcedures = selectedProcedures.filter(
            (proc) =>
                !userProceduresList.some((p) => p._id === proc._id) &&
                !addedProcedures.some((p) => p._id === proc._id)
        );

        if (newProcedures.length > 0) {
            setAddedProcedures((prev) => [...prev, ...newProcedures]);
        } else {
            console.log('No new procedures to add, all are duplicates');
        }
    };

    const handleToggleEdit = () => {
        setIsEditing((prev) => !prev);
        if (isEditing) handleSaveProcedures();
    };

    const formattedAmount = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(totalAmount);

    return (
        <div>
            <div className="grid grid-cols-2 gap-4">
                <p className="text-xl"><strong>Procedures:</strong></p>
                <div className="flex justify-end">
                    <button
                        onClick={handleToggleEdit}
                        className={`px-4 py-2 rounded bg-[#025373] hover:bg-[#03738C] text-white`}
                    >
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                </div>
            </div>

            {userProceduresList.length > 0 ? (
                <div className="overflow-y-auto max-h-72 my-4">
                    <table className="hover:bg-gray-100 min-w-full mb-4 table-fixed">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-center text-white w-1/2 sticky top-0 bg-[#012840]">Procedure Name</th>
                                <th className="px-4 py-2 text-center text-white w-1/4 sticky top-0 bg-[#012840]">Price</th>
                                {isEditing && <th className="px-4 py-2 text-center text-white w-1/4 sticky top-0 bg-[#012840]">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {userProceduresList.map((procedure) => (
                                <tr key={procedure._id} className={markedForRemoval.includes(procedure._id) ? 'bg-red-200' : ''}>
                                    <td className="border px-4 py-2 truncate">{procedure.Procedure_name}</td>
                                    <td className="border px-4 py-2 truncate">{`₱ ${procedure.Price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}</td>
                                    {isEditing && (
                                        <td className="border px-4 py-2 text-center">
                                            {markedForRemoval.includes(procedure._id) ? (
                                                <button
                                                    className="text-red-500"
                                                    onClick={() => handleRemoveProcedure(procedure._id)}
                                                    aria-label={`Remove ${procedure.Procedure_name}`}
                                                >
                                                    Remove
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-red-500"
                                                    onClick={() => handleMarkForRemoval(procedure._id)}
                                                    aria-label={`Delete ${procedure.Procedure_name}`}
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {addedProcedures.map((procedure) => (
                                <tr key={procedure._id}>
                                    <td className="border px-4 py-2 truncate">{procedure.Procedure_name}</td>
                                    <td className="border px-4 py-2 truncate">{`PHP ${procedure.Price}`}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <button
                                            className="text-red-500"
                                            onClick={() => handleRemoveProcedure(procedure._id)}
                                            aria-label={`Remove ${procedure.Procedure_name}`}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No procedures available</p>
            )}

            {isEditing && (
                <div className="flex justify-between pb-4">
                    <button
                        className="bg-[#025373] hover:bg-[#03738C] text-white px-4 py-2 rounded"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add Procedures
                    </button>
                    <button
                        className="bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white px-4 py-2 rounded"
                        onClick={() => {
                            setAddedProcedures([]);
                            setIsEditing(false);
                            setMarkedForRemoval([]);
                        }}
                    >
                        Cancel Add Procedures
                    </button>
                </div>
            )}

            <div className="flex justify-between mt-4 space-x-1">
                <p className="font-semibold">Total of all procedures:</p>
                <p className="font-semibold">{formattedAmount}</p>
            </div>

            <ProceduresModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                allProcedures={allProcedures}
                onSelectProcedures={handleSelectProcedures}
                appointment={appointment}
                addedProcedures={addedProcedures}
            />
        </div>
    );
};

export default ProceduresTable;
