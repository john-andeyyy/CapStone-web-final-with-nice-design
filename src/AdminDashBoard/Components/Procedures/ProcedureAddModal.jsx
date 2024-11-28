import React from 'react';
import Modal from '../Modal';

const ProcedureAddModal = ({
    isOpen,
    closeModal,
    newProcedure,
    setNewProcedure,
    handleAddSubmit,
    imagePreview,
    setImagePreview,
}) => {
    return (
        <Modal isOpen={isOpen} close={closeModal}>
            <h3 className="font-bold text-lg text-center">Add New Procedure</h3>
            <form onSubmit={handleAddSubmit} className="flex flex-col">
                {/* Procedure Name */}
                <div className="label">
                    <span className="label-text mt-5">Procedure Name</span>
                </div>
                <input
                    type="text"
                    placeholder="Procedure Name"
                    value={newProcedure.Procedure_name}
                    onChange={(e) => setNewProcedure({ ...newProcedure, Procedure_name: e.target.value })}
                    className="border p-2 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-500"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    {/* Duration Section */}
                    <div className="flex flex-col">
                        <label className="label">
                            <span className="label-text">Estimated Duration</span>
                        </label>
                        <div className="flex items-center gap-2">
                            {/* Hours Input */}
                            <input
                                type="number"
                                placeholder="Hours"
                                value={newProcedure.Duration ? Math.floor(newProcedure.Duration / 60) : ''}
                                onChange={(e) => {
                                    const hours = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                    const totalMinutes = hours === ''
                                        ? newProcedure.Duration % 60
                                        : hours * 60 + (newProcedure.Duration % 60);
                                    setNewProcedure({ ...newProcedure, Duration: totalMinutes });
                                }}
                                className="border p-2 w-20   bg-gray-100 focus:outline-none focus:ring focus:ring-blue-500"
                                min="0"
                                required
                            />
                            <span>Hrs</span>

                            {/* Minutes Input */}
                            <input
                                type="number"
                                placeholder="Minutes"
                                value={newProcedure.Duration ? newProcedure.Duration % 60 : ''}
                                onChange={(e) => {
                                    const minutes = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                    const totalMinutes =
                                        (Math.floor(newProcedure.Duration / 60) * 60) +
                                        (minutes === '' ? 0 : minutes);
                                    setNewProcedure({ ...newProcedure, Duration: totalMinutes });
                                }}
                                className="border p-2 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-500 w-20"
                                min="0"
                                max="59"
                                required
                            />
                            <span>Mins</span>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="flex flex-col">
                        <label className="label ml-5">
                            <span className="label-text">Price</span>
                        </label>
                        <div className="relative ml-5">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                            <input
                                type="number"
                                placeholder="Price"
                                value={newProcedure.Price}
                                onChange={(e) => setNewProcedure({ ...newProcedure, Price: e.target.value })}
                                className="border p-2 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-500  pl-8 " // Add padding left to avoid overlap with the peso sign
                                required
                            />
                        </div>
                    </div>

                </div>

                {/* Description */}
                <div className="label">
                    <span className="label-text">Description</span>
                </div>
                <input
                    type="text"
                    placeholder="Description"
                    value={newProcedure.Description}
                    onChange={(e) => setNewProcedure({ ...newProcedure, Description: e.target.value })}
                    className="border p-2 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-500mb-2 "
                    required
                />

                {/* Upload Picture */}
                <div className="flex flex-col">
                    <label className="label">
                        <span className="label-text">Upload Picture</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            setNewProcedure({ ...newProcedure, Image: file });
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setImagePreview(reader.result);
                                };
                                reader.readAsDataURL(file);
                            } else {
                                setImagePreview(null);
                            }
                        }}
                        className="border p-2 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-500 mb-2 "
                    />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Image Preview"
                        className="mt-2 border rounded"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                    />
                )}

                {/* Modal Actions */}
                <div className="modal-action">
                    
                    <button
                        type="button"
                        className="btn bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white"
                        onClick={() => {
                            closeModal();
                            setImagePreview(null);
                        }}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn bg-[#025373] hover:bg-[#03738C] text-white">
                        Add Procedure
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ProcedureAddModal;
