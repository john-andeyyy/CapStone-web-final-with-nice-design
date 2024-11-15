import React, { useState } from 'react';
import SemiFullModal from '../../../../ComponentModal/MediumModal';

const AddToothModal = ({ isOpen, onClose, onAdd, patientId }) => {
    // Set default values for name and status
    const [name, setName] = useState('extra teeth'); // Default to "extra teeth"
    const [status, setStatus] = useState('healthy'); // Default to "healthy"
    const [jaw, setJaw] = useState('Upper'); // Default to Upper
    const [position, setPosition] = useState('first'); // Default to first

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTooth = { patientId: patientId, jaw, name, status, position };
        onAdd(newTooth);
        onClose(); // Close the modal after adding
    };

    return (
        <SemiFullModal isOpen={isOpen} onClose={onClose}>
            <div className="p-2">
                <>
                    <h2 className="text-lg font-bold text-[#00000] text-center">Add New Tooth</h2>
                    <form onSubmit={handleSubmit}>
                    <div className=" gap-4 mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col w-1/2">
                            <label className="block text-sm mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-gray-100 shadow-md border rounded w-full py-2 px-3"
                            />
                            </div>
                            
                        <div className="flex flex-col w-1/2">
                            <label className="block text-sm mb-1">Status</label>
                            <input
                                type="text" // Change from select to input
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                                className="bg-gray-100 shadow-md border rounded w-full py-2 px-3"
                            />
                        </div>
                    </div>
                    </div>
                        
                        <div className=" gap-4 mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col w-1/2">
                            <label className="block text-sm mb-1">Jaw</label>
                            <select
                                value={jaw}
                                onChange={(e) => setJaw(e.target.value)}
                                className="bg-gray-100 shadow-md border rounded w-full py-2 px-3"
                            >
                                <option value="Upper">Upper</option>
                                <option value="Lower">Lower</option>
                            </select>
                            </div>

                            <div className="flex flex-col w-1/2">
                            <label className="block text-sm mb-1">Position</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="bg-gray-100 shadow-md border rounded w-full py-2 px-3"
                            >
                                <option value="first">First</option>
                                <option value="last">Last</option>
                            </select>
                            </div>
                        </div>
                        </div>


                        
                        <div className="flex justify-center mt-10">
                            {/* <button type="button" className="mr-2 text-gray-500" onClick={onClose}>
                                Cancel
                            </button> */}
                            <button type="submit" className="bg-[#025373] hover:bg-[#03738C] text-white py-2 px-4 rounded">
                                Add Tooth
                            </button>
                        </div>
                    </form>
                </>
            </div>
        </SemiFullModal>
    );
};

export default AddToothModal;
