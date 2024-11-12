import React, { useState } from 'react';
import Modal from '../../../Components/Modal';

const ConfirmAppointmentModal = ({ isOpen, patient, dentist, procedures, date, timeSlot, onConfirm, onCancel }) => {
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);

    if (!isOpen) return null;

    // Format the date as 'Month Day, Year'
    const formattedDate = date?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleConfirm = () => {
        onConfirm(notes);
    }
    const handleCheckboxChange = (event) => {
        setShowNotes(event.target.checked); // Set to true when checked, false when unchecked
    };

    return (
        <Modal isOpen={isOpen} onClose={onCancel}>
            <div className="p-6 bg-white rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Appointment</h3>

                <div className="mb-4 text-gray-700">
                    <p><strong>Patient:</strong> {patient?.FirstName} {patient?.LastName}</p>
                    <p><strong>Dentist:</strong> {dentist?.FirstName} {dentist?.MiddleName} {dentist?.LastName}</p>

                    {/* Procedures and Prices in a Table with Scroll */}
                    <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Procedure Name</th>
                                    <th className="p-2">Price (₱)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {procedures.map((proc) => (
                                    <tr key={proc._id} className="border-b">
                                        <td className="p-2">{proc.Procedure_name}</td>
                                        <td className="p-2">₱{proc.Price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-4">
                        <strong>Total Price:</strong> ₱ {procedures.reduce((total, proc) => total + proc.Price, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p><strong>Date:</strong> {formattedDate}</p>
                    <p><strong>Time Slot:</strong> {timeSlot?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>


                    <label className="cursor-pointer p-3 flex items-center">
                        <input
                            type="checkbox"
                            defaultChecked={showNotes}
                            onChange={handleCheckboxChange}
                            className="checkbox checkbox-success checkbox-xs"
                        />
                        <span className="label-text ml-2">Add Notes</span> 
                    </label>

                    
                    {/* Notes Textbox */}
                    {showNotes && (
                        <div className="mt-4">
                            <label htmlFor="notes" className="block text-gray-700">Notes: <span className='text-red-500 text-sm'>Optional</span></label>
                            <textarea
                                id="notes"
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                                placeholder="Add any notes here..."
                            />
                        </div>
                    )}


                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onCancel}
                        className="bg-[#D9D9D9] hover:bg-[#ADAAAA] text-gray-800 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-[#4285F4] hover:bg-[#0C65F8] text-white px-4 py-2 rounded"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmAppointmentModal;
