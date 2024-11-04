import React from 'react';
import Modal from '../Modal';

const ProcedureEditModal = ({
    isOpen,
    closeModal,
    procedure,
    setProcedure,
    handleEditSubmit,
    imagePreview,
    setImagePreview,
}) => {
    if (!procedure) return null;

    return (
        <Modal isOpen={isOpen} close={closeModal}>
            <div className="absolute top-2 right-2">
                <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 transition"
                    onClick={() => {
                        closeModal();
                        setImagePreview(null);
                    }}
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>

            <div className="text-black">
                <h3 className="font-bold text-lg text-center text-[#266D53] mt-5 mb-5">Edit Procedure</h3>
                <form onSubmit={handleEditSubmit} className="flex flex-col">
                    {/* Upload Picture */}
                    <div className="flex flex-col">
                        <label className="label">
                            <span className="label-text">Upload Picture</span>
                        </label>
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setProcedure({ ...procedure, Image: file });
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setImagePreview(reader.result);
                                    reader.readAsDataURL(file);
                                } else {
                                    setImagePreview(null);
                                }
                            }}
                            className="border p-2 bg-white"
                        />
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Image Preview"
                                className="mt-2 border rounded"
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                            />
                        )}
                    </div>

                    {/* Procedure Name */}
                    <div className="label">
                        <span className="label-text">Procedure Name</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Procedure Name"
                        value={procedure.Procedure_name}
                        onChange={(e) => setProcedure({ ...procedure, Procedure_name: e.target.value })}
                        className="border p-2 bg-white"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4 items-start">
                        {/* Duration Section */}
                        <div>
                            <label className="label">
                                <span className="label-text">Estimated Duration</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Hours"
                                    value={procedure.Duration !== null ? Math.floor(procedure.Duration / 60) : ''}
                                    onChange={(e) => {
                                        const hours = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                        const totalMinutes =
                                            hours === '' ? (procedure.Duration % 60) : (hours * 60 + (procedure.Duration % 60));
                                        setProcedure({ ...procedure, Duration: totalMinutes });
                                    }}
                                    className="border p-2 bg-white w-20"
                                    min="0"
                                    required
                                />
                                <span>Hrs</span>
                                <input
                                    type="number"
                                    placeholder="Minutes"
                                    value={procedure.Duration !== null ? procedure.Duration % 60 : ''}
                                    onChange={(e) => {
                                        const minutes = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                        const totalMinutes =
                                            Math.floor(procedure.Duration / 60) * 60 + (minutes || 0);
                                        setProcedure({ ...procedure, Duration: totalMinutes });
                                    }}
                                    className="border p-2 bg-white w-20"
                                    min="0"
                                    max="59"
                                    required
                                />
                                <span>Mins</span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div>
                            <label className="label">
                                <span className="label-text">Price</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Price"
                                value={procedure.Price}
                                onChange={(e) => setProcedure({ ...procedure, Price: e.target.value })}
                                className="border p-2 bg-white w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="label">
                        <span className="label-text">Description</span>
                    </div>
                    <textarea
                        type="text"
                        value={procedure.Description}
                        readOnly
                        className="border p-2 mb-2 bg-white max-h-40 min-h-28"
                    />

                    {/* Save Changes Button */}
                    <div className="modal-action justify-center items-center">
                        <button type="submit" className="btn btn-success bg-blue-500 hover:bg-blue-500 text-white">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ProcedureEditModal;
