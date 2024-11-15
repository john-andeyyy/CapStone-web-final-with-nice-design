import React, { useState } from 'react';
import SemiFullModal from '../../../../ComponentModal/MediumModal';

const AddToothModal = ({ isOpen, onClose, onAdd, patientId }) => {
    // Set default values for name and status
    const [name, setName] = useState('extra teeth'); // Default to "extra teeth"
    const [status, setStatus] = useState('healthy'); // Default to "healthy"
    const [jaw, setJaw] = useState('Upper'); // Default to Upper
    const [position, setPosition] = useState('first'); // Default to first
    const [toothType, setToothType] = useState('Permanent');


    const handleSubmit = (e) => {
        e.preventDefault();
        const newTooth = { patientId: patientId, jaw, name, status, position, toothType };
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
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        required
                                        className="bg-gray-100 shadow-md border rounded w-full py-2 px-3"
                                        placeholder="Enter status"
                                    >
                                        <option value="Healthy">Healthy</option>
                                        <option value="Gingivitis">Gingivitis</option>
                                        <option value="Periodontitis (mild)">Periodontitis (mild)</option>
                                        <option value="Periodontitis (moderate)">Periodontitis (moderate)</option>
                                        <option value="Periodontitis (severe)">Periodontitis (severe)</option>
                                        <option value="Missing">Missing</option>
                                        <option value="Implant">Implant</option>
                                        <option value="Decay">Decay</option>
                                        <option value="Restored">Restored</option>
                                        <option value="Abscess">Abscess</option>
                                        <option value="Bleeding on Probing">Bleeding on Probing</option>
                                        <option value="Calculus Present">Calculus Present</option>
                                    </select>

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

                        <div className="flex flex-col w-1/2">
                            <div className="flex flex-col ">
                                <label className="block text-sm mb-1">Tooth Type:</label>
                                <select
                                    value={toothType}
                                    onChange={(e) => setToothType(e.target.value)}
                                    className="bg-gray-100 shadow-md border rounded w-full py-2 px-3"
                                    required
                                >
                                    <option value="Permanent">Permanent</option>
                                    <option value="Temporary">Temporary</option>
                                </select>
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
