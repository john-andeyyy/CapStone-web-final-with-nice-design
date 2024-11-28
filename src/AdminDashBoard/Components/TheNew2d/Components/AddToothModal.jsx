import React, { useState } from 'react';
import SemiFullModal from '../../../../ComponentModal/MediumModal';

const AddToothModal = ({ isOpen, onClose, onAdd, patientId }) => {
    const [name, setName] = useState('Supernumerary teeth');
    const [status, setStatus] = useState([]);
    const [jaw, setJaw] = useState('Upper');
    const [position, setPosition] = useState('first');
    const [toothType, setToothType] = useState('Permanent');

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setStatus((prevStatus) => {
            if (prevStatus.includes(value)) {
                return prevStatus.filter((item) => item !== value);
            } else {
                return [...prevStatus, value];
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTooth = { patientId, jaw, name, status, position, toothType };
        onAdd(newTooth);
        onClose();
    };

    return (
        <SemiFullModal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 bg-white shadow-lg rounded-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Add New Tooth</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-gray-100 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2">Tooth Type</label>
                            <select
                                value={toothType}
                                onChange={(e) => setToothType(e.target.value)}
                                className="bg-gray-100 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="Permanent">Permanent</option>
                                <option value="Temporary">Temporary</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2">Jaw</label>
                            <select
                                value={jaw}
                                onChange={(e) => setJaw(e.target.value)}
                                className="bg-gray-100 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Upper">Upper</option>
                                <option value="Lower">Lower</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2">Position</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="bg-gray-100 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="first">First</option>
                                <option value="last">Last</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2">Status</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Healthy', 'Gingivitis', 'Periodontitis (mild)', 'Periodontitis (moderate)', 'Periodontitis (severe)', 'Extracted', 'Implant', 'Decay', 'Restored', 'Abscess', 'Bleeding on Probing', 'Calculus Present'].map((statusOption) => (
                                    <div key={statusOption} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={statusOption}
                                            checked={status.includes(statusOption)}
                                            onChange={handleStatusChange}
                                            className="mr-2 checkbox checkbox-success"
                                        />
                                        <label className="text-sm font-medium text-gray-700">{statusOption}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-center mt-8">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Add Tooth
                        </button>
                    </div>
                </form>
            </div>
        </SemiFullModal>
    );
};

export default AddToothModal;
