import React from 'react';

const ProcedureTable = ({
    procedures,
    formatDuration,
    openEditProcedureModal,
    confirmToggleStatus,
    openViewModal,
    openEditModal
}) => {
    const sortedProcedures = procedures.sort((a, b) =>
        a.Procedure_name.localeCompare(b.Procedure_name)
    );

    return (
        <div className="text-sm overflow-auto max-h-[74vh] bg-gray-100">
            <table className="w-full border border-gray-500">
                <thead className="bg-[#012840] text-sm">
                    <tr>
                        <th className="border border-gray-500 p-2 text-white">Procedure Name</th>
                        <th className="border border-gray-500 p-2 text-white hidden lg:table-cell">Estimated Duration</th>
                        <th className="border border-gray-500 p-2 text-white hidden lg:table-cell">Price</th>
                        <th className="border border-gray-500 p-2 text-white hidden lg:table-cell">Status</th>
                        <th className="border border-gray-500 text-white p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProcedures.map((procedure) => (
                        <tr key={procedure._id} className="hover:bg-neutral transition duration-200">
                            <td className="border border-black p-2">{procedure.Procedure_name}</td>
                            <td className="border border-black p-2 hidden lg:table-cell">
                                {formatDuration(procedure.Duration)}
                            </td>
                            <td className="border border-black p-2 hidden lg:table-cell">
                                <span>₱</span>
                                {new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(procedure.Price)}
                            </td>

                            <td className="border border-black p-2 hidden lg:table-cell">
                                <div className={`text-${procedure.available ? 'green' : 'red'}-500`}>
                                    {procedure.available ? 'In Service' : 'Out of Service'}
                                </div>
                            </td>
                            <td className="border border-gray-400 p-2 flex gap-2 justify-center">
                                <button
                                    className="flex flex-col items-center justify-center w-10 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-lg shadow-sm"
                                    onClick={() => openViewModal(procedure, 'View')}
                                    title="View"
                                >
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                                <button
                                    className="flex flex-col items-center justify-center w-10 bg-gray-200 text-gray-500 hover:text-gray-600 transition rounded-lg shadow-sm"
                                    onClick={() => openEditModal(procedure, 'Edit')}
                                    title="Edit"
                                >
                                    <span className="material-symbols-outlined text-lg" aria-hidden="true">edit</span>
                                </button>
                                <button
                                    className={`flex flex-col items-center justify-center w-10 transition rounded-lg shadow-sm 
                    ${procedure.available ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}
                                    onClick={() => confirmToggleStatus(procedure, !procedure.available)}
                                    title={procedure.available ? 'Set Out of Service' : 'Set In Service'}
                                >
                                    <span className="material-symbols-outlined">
                                        {procedure.available ? 'cancel' : 'check_circle'}
                                    </span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProcedureTable;
