import React, { useEffect, useState } from 'react';

const CreateDentist = ({ showAddModal, handleCreateDentist, handleCloseAddModal, newNewDentistData, errorMessage }) => {
    const [error, setError] = useState('');

    const close =()=>{
        handleCloseAddModal()
        setNewDentist({
                FirstName: '',
                LastName: '',
                MiddleName: '',
                ContactNumber: '',
                Address: '',
                Gender: '',
                LicenseNo: '',
                ProfilePicture: null,
                Username: '',
                Password: '',
                Email: ''
            })
        setError('')
    }
    
    const [newDentist, setNewDentist] = useState({
        FirstName: '',
        LastName: '',
        MiddleName: '',
        ContactNumber: '',
        Address: '',
        Gender: '',
        LicenseNo: '',
        ProfilePicture: null,
        Username: '',
        Password: '',
        Email: ''
    });


    useEffect(() => {
        setError(errorMessage);
    }, [errorMessage]);

    

    const handleSubmit = (event) => {
        event.preventDefault();
        newNewDentistData(newDentist);
        handleCreateDentist(newDentist); // Pass newDentist directly without event
        console.log('event', event);
        setNewDentist({
            FirstName: '',
            LastName: '',
            MiddleName: '',
            ContactNumber: '',
            Address: '',
            Gender: '',
            LicenseNo: '',
            ProfilePicture: null,
            Username: '',
            Password: '',
            Email: ''
        })
    };


    const [previewImage, setPreviewImage] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (name === 'ContactNumber') {
            const cleanedValue = value.replace(/\D/g, ''); 
            const limitedValue = cleanedValue.slice(0, 11);  
            setNewDentist((prev) => ({ ...prev, [name]: limitedValue }));
        }
        // Handling for file input
        else if (type === 'file') {
            const file = files[0];
            setNewDentist((prev) => ({ ...prev, [name]: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);  
            reader.readAsDataURL(file);
        }
        // Handling for all other inputs
        else {
            setNewDentist((prev) => ({ ...prev, [name]: value }));
        }
    };

    return (
        showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form className="bg-white rounded-lg p-6 w-10/12 max-w-2xl" onSubmit={handleSubmit}>
                    <h2 className="text-2xl mb-4 text-center">Add Dentist</h2>
                    <p className='text-red-500'>{error}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                        <div className="flex flex-col">
                            <label className="font-semibold mb-1">First Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="FirstName"
                                placeholder="First Name"
                                value={newDentist.FirstName}
                                onChange={handleChange}
                                required
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">Last Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="LastName"
                                placeholder="Last Name"
                                value={newDentist.LastName}
                                onChange={handleChange}
                                required
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">Middle Name</label>
                            <input
                                type="text"
                                name="MiddleName"
                                placeholder="Middle Name"
                                value={newDentist.MiddleName}
                                onChange={handleChange}
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>
                    

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">Contact Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="ContactNumber"
                                placeholder="09XXXXXXXXX"
                                value={newDentist.ContactNumber}
                                onChange={handleChange}
                                required
                                maxLength={11}
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">Address <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="Address"
                                placeholder="Address"
                                value={newDentist.Address}
                                onChange={handleChange}
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">Gender <span className="text-red-500">*</span></label>
                            <select
                                name="Gender"
                                value={newDentist.Gender}
                                onChange={handleChange}
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">License No <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="LicenseNo"
                                placeholder="License No"
                                value={newDentist.LicenseNo}
                                onChange={handleChange}
                                required
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">Username <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="Username"
                                placeholder="Username"
                                value={newDentist.Username}
                                onChange={handleChange}
                                required
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                name="Password"
                                placeholder="Password"
                                value={newDentist.Password}
                                onChange={handleChange}
                                required
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold  mb-1">Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                name="Email"
                                placeholder="Email"
                                value={newDentist.Email}
                                onChange={handleChange}
                                required
                                className="w-full mb-4 p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={()=>{close()}} className="bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white py-2 rounded">Close</button>
                        <button
                            type="submit"
                            className="bg-[#025373] hover:bg-[#03738C] text-white py-2 rounded"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        )
    );
};

export default CreateDentist;
