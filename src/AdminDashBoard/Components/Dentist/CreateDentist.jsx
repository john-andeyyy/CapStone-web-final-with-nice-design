import React, { useState } from 'react';

const CreateDentist = ({ showAddModal, handleCreateDentist, handleCloseAddModal }) => {
    const [newDentist, setNewDentist] = useState({
        FirstName: '',
        LastName: '',
        MiddleName: '',
        ContactNumber: '',
        Address: '',
        Gender: '',
        LicenseNo: '',
        ProfilePicture: null
    });

    const [previewImage, setPreviewImage] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setNewDentist((prev) => ({ ...prev, [name]: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        } else {
            setNewDentist((prev) => ({ ...prev, [name]: value }));
        }
    };

    return (
        showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form className="bg-[#C6E4DA] rounded-lg p-6 w-11/12 max-w-lg" onSubmit={handleCreateDentist}>
                    <h2 className="text-2xl mb-4 text-[#266D53] text-center">Add Dentist</h2>

                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <div className="flex flex-col">
                            <label className="text-[#266D53] mb-1">First Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="FirstName"
                                placeholder="First Name"
                                value={newDentist.FirstName}
                                onChange={handleChange}
                                required
                                className="w-full mb-4 p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#266D53] mb-1">Last Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="LastName"
                                placeholder="Last Name"
                                value={newDentist.LastName}
                                onChange={handleChange}
                                required
                                className="w-full mb-4 p-2 border border-gray-300 rounded"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-[#266D53] mb-1">Middle Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="MiddleName"
                                placeholder="Middle Name"
                                value={newDentist.MiddleName}
                                onChange={handleChange}
                                className="w-full mb-4 p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#266D53] mb-1">Contact Number <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="ContactNumber"
                                placeholder="09XXXXXXXXX"
                                value={newDentist.ContactNumber}
                                onChange={handleChange}
                                required
                                maxLength={11}
                                className="w-full mb-4 p-2 border border-gray-300 rounded"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-[#266D53] mb-1">Address <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="Address"
                                placeholder="Address"
                                value={newDentist.Address}
                                onChange={handleChange}
                                className="w-full mb-4 p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#266D53] mb-1">Gender <span className="text-red-500">*</span></label>
                            <select
                                name="Gender"
                                value={newDentist.Gender}
                                onChange={handleChange}
                                className="w-full mb-4 p-2 border border-gray-300 rounded"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[#266D53] mb-1">License No <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="LicenseNo"
                            placeholder="License No"
                            value={newDentist.LicenseNo}
                            onChange={handleChange}
                            required
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div className="text-black mb-3">
                        <p>Upload Picture</p>
                    </div>

                    <input
                        type="file"
                        name="ProfilePicture"
                        accept="image/*"
                        onChange={handleChange}
                        className="mb-4"
                    />
                    {previewImage && (
                        <img src={previewImage} alt="Profile Preview" className="w-32 h-32 rounded mb-4 flex" />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="submit"
                            className="bg-[#4285F4] hover:bg-[#0C65F8] text-black py-2 rounded"
                        >
                            Add
                        </button>
                        <button onClick={handleCloseAddModal} className="bg-[#D9D9D9] hover:bg-[#ADAAAA] text-black py-2 rounded">Close</button>
                    </div>
                </form>
            </div>
        )
    );
};

export default CreateDentist;
