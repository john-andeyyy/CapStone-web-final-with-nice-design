import React from 'react';
import Modal from '../Modal';

const ProcedureViewModal = ({
    isOpen,
    closeModal,
    procedure,
    formatDuration,
    getProfileImage,
}) => {
    if (!procedure) return null;

    return (
        <Modal isOpen={isOpen} close={closeModal}>
            <div className="absolute top-2 right-2 text-xlg">
                <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 transition"
                    onClick={closeModal}
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>

            <h3 className="font-bold text-lg text-center text-[#266D53]">View Procedure</h3>
            <div className="flex justify-center mt-5">
                <figure>
                    <img
                        src={getProfileImage(procedure.Image)}
                        alt="Procedure"
                        className="object-cover h-36 p-1"
                    />
                </figure>
            </div>

            <div className="flex flex-col">
                <div className="label justify-center items-center">
                    <span className="label-text">Procedure Name</span>
                </div>
                <input
                    type="text"
                    value={procedure.Procedure_name}
                    readOnly
                    className="border p-2 mb-2 bg-white"
                />

                <div className="grid grid-cols-2 gap-4">
                    {/* Duration Field */}
                    <div className="flex flex-col">
                        <label className="label">
                            <span className="label-text">Estimated Duration</span>
                        </label>
                        <input
                            type="text"
                            value={formatDuration(procedure.Duration)}
                            readOnly
                            className="border p-2 bg-white"
                        />
                    </div>

                    {/* Price Field */}
                    <div className="flex flex-col">
                        <label className="label">
                            <span className="label-text">Price</span>
                        </label>
                        <input
                            type="text"
                            value={`₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(procedure.Price)}`}
                            readOnly
                            className="border p-2 bg-white"
                        />
                    </div>

                </div>

                <div className="label">
                    <span className="label-text">Description</span>
                </div>
                <textarea
                    type="text"
                    value={procedure.Description}
                    readOnly
                    className="border p-2 mb-2 bg-white max-h-40 min-h-28"
                />
            </div>
        </Modal>
    );
};

export default ProcedureViewModal;
