import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Baseurl = import.meta.env.VITE_BASEURL;

export default function ProceduresSelector({ onselectprocedures, isSubmited }) {
    const [procedurelist, setProcedureList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalDuration, setTotalDuration] = useState(0);
    const [selectionError, setSelectionError] = useState('');

    // Reset states when submitted
    useEffect(() => {
        if (isSubmited) {
            setSelectedProcedures([]);
            onselectprocedures(null);
            setSearchTerm('');
            setTotalDuration(0);
            setSelectionError('');
        }
    }, [isSubmited]);

    // Fetch available procedures
    useEffect(() => {
        const fetchProcedures = async () => {
            try {
                const response = await axios.get(`${Baseurl}/Procedure/names`);
                const data = response.data
                    .filter((pro) => pro.available)
                    .sort((a, b) => a.Procedure_name.localeCompare(b.Procedure_name));
                setProcedureList(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProcedures();
    }, []);

    // Handle body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    }, [isModalOpen]);

    // Calculate total duration of selected procedures
    useEffect(() => {
        const total = selectedProcedures.reduce((sum, procedure) => sum + Number(procedure.Duration || 0), 0);
        setTotalDuration(total);
        onselectprocedures(selectedProcedures, total);
    }, [selectedProcedures, onselectprocedures]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectionError('');
    };

    // Handle procedure checkbox selection
    const handleCheckboxChange = (procedure) => {
        setSelectionError('');
        setSelectedProcedures((prevSelected) => {
            if (prevSelected.includes(procedure)) {
                return prevSelected.filter(p => p !== procedure);
            } else if (prevSelected.length < 3) {
                return [...prevSelected, procedure];
            } else {
                setSelectionError("You can only select up to 3 procedures.");
                return prevSelected;
            }
        });
    };

    // Format duration for display
    const formatDuration = (duration) => {
        const numericDuration = Number(duration);
        if (isNaN(numericDuration)) return '0 mins';

        const hours = Math.floor(numericDuration / 60);
        const minutes = numericDuration % 60;

        return `${hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : ''} ${minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : ''}`.trim();
    };

    // Filter procedures based on search term
    const filteredProcedures = procedurelist.filter((pro) =>
        pro.Procedure_name && pro.Procedure_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='p-4'>
            <button
                className="bg-[#3EB489] hover:bg-[#62A78E] text-white px-4 py-2 rounded"
                onClick={() => setIsModalOpen(true)}
            >
                Select Procedures
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-65 flex justify-center items-center z-50">
                    <div className="bg-[#C6E4DA] rounded-lg shadow-lg p-6 w-[64rem]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-[#266D53]">Select Procedures</h2>
                            <button
                                className="text-gray-600 hover:text-gray-800 text-3xl"
                                onClick={() => setIsModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <label htmlFor="procedure-search" className="block text-gray-700">Search procedure:</label>
                        <input
                            type="text"
                            id="procedure-search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search procedure by name"
                            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                        />

                        <div className='py-4 text-center'>
                            {error && (
                                <p className="text-red-500">Error: {error.message}</p>
                            )}
                            {selectionError && (
                                <p className="text-red-500">{selectionError}</p>
                            )}

                        </div>
                        <div className="max-h-80 overflow-y-auto text-black">

                            {loading ? (
                                <div className="flex justify-center items-center">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredProcedures.length > 0 ? (
                                        <div className=''>
                                            {filteredProcedures.map((procedure, index) => (
                                                <div
                                                    key={procedure._id}
                                                    className={`flex items-center space-x-2 p-3 ${index % 2 === 0 ? 'bg-[#3EB489]' : 'bg-[#66deb2]'}`}
                                                    onClick={() => handleCheckboxChange(procedure)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={procedure._id}
                                                        onChange={() => handleCheckboxChange(procedure)}
                                                        className="form-checkbox"
                                                        checked={selectedProcedures.includes(procedure)}
                                                    />
                                                    <div className="grid grid-cols-2 flex-1 cursor-pointer"> {/* Added cursor pointer */}
                                                        <div className="font-medium">{procedure.Procedure_name}</div>
                                                        <div className="text-right">{formatDuration(procedure.Duration)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No procedures found</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-sm font-medium text-gray-700">
                            <p>Total Duration: {formatDuration(totalDuration)}</p>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            {/* <button
                                className="bg-[#D9D9D9] hover:bg-[#ADAAAA] text-black px-4 py-2 rounded"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Close
                            </button> */}
                            <button
                                className="bg-[#4285F4] hover:bg-[#0C65F8] text-white px-4 py-2 rounded"
                                onClick={() => {
                                    onselectprocedures(selectedProcedures, totalDuration);
                                    setIsModalOpen(false);
                                }}
                            >
                                Save Procedures
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
