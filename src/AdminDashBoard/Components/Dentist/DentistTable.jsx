import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnavailableDentist from './UnavailableDentist'; // Assuming this is your modal component

const DentistTable = ({ loading, filteredDentists, handleRowClick, handle_availability, openModal, closeModal, isModalOpen, selectedDentistId }) => {
    const navigate = useNavigate();

    return (
        <div className="w-full overflow-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
                <thead>
                    <tr className="text-sm text-white bg-primary">
                        <th className="py-3 px-2 sm:px-5 bg-[#012840] text-center border border-black">Name</th>
                        <th className="py-3 px-2 sm:px-5 bg-[#012840] text-center border border-black">Available</th>
                        <th className="py-3 px-2 sm:px-5 bg-[#012840] text-center border border-black">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="3" className="py-3 px-2 sm:px-5 text-center">
                                <span className="loading loading-spinner loading-lg"></span>
                            </td>
                        </tr>
                    ) : filteredDentists.length > 0 ? (
                        filteredDentists.map((dentist) => (
                            <tr key={dentist._id} className="hover:bg-secondary border-b">
                                <td className="py-2 sm:py-3 px-2 sm:px-5 bg-white border border-black">{`${dentist.FirstName} ${dentist.LastName}`}</td>
                                <td className="py-2 sm:py-3 px-2 sm:px-5 bg-white border border-black">{dentist.isAvailable ? 'Yes' : 'No'}</td>
                                <td className="py-2 sm:py-3 px-2 sm:px-5 space-x-1 sm:space-x-3 text-center bg-white border border-black">
                                    <div className="flex-1 flex gap-1 sm:gap-2 justify-center">
                                        <button
                                            className="flex flex-col items-center justify-center w-8 sm:w-10 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-lg shadow-sm"
                                            onClick={() => handleRowClick(dentist)}
                                            title="view"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                        <button
                                            className={`flex items-center ${dentist.isAvailable ? 'text-green-500 flex flex-col items-center justify-center w-8 sm:w-10 bg-green-100 transition rounded-lg shadow-sm' : 'text-red-500 flex flex-col items-center justify-center w-8 sm:w-10 bg-red-100 transition rounded-lg shadow-sm'}`}
                                            onClick={() => handle_availability(dentist)}
                                            title={dentist.isAvailable ? 'to unavailable' : 'to available'}
                                        >
                                            <span className="material-symbols-outlined">
                                                {dentist.isAvailable ? 'check_circle' : 'do_not_disturb_on'}
                                            </span>
                                        </button>
                                        <button
                                            className="text-yellow-500 flex flex-col items-center justify-center w-8 sm:w-10 bg-yellow-100 hover:text-yellow-600 transition rounded-lg shadow-sm"
                                            onClick={() => navigate(`/DentistSchedule/${dentist._id}`)}
                                            title="Schedule"
                                        >
                                            <span className="material-symbols-outlined">calendar_month</span>
                                        </button>
                                        <button
                                            className="text-gray-500 flex flex-col items-center justify-center w-8 sm:w-10 bg-gray-200 hover:text-gray-600 transition rounded-lg shadow-sm"
                                            onClick={() => openModal(dentist._id)}
                                            title="manage availability"
                                        >
                                            <span className="material-symbols-outlined">manage_accounts</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="py-3 px-2 sm:px-5 text-center">No dentists found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-white">
                            <span className="material-symbols-outlined text-gray-500">close</span>
                        </button>
                        <UnavailableDentist dentistId={selectedDentistId} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DentistTable;
