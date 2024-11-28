import React from 'react';

const DentistDetailsModal = ({ showModal, selectedDentist, setisEditmodal, setShowModal, handleCloseModal }) => {
    const getProfileImage = (imageData) => {
        return imageData ? `data:image/jpeg;base64,${imageData}` : 'default-avatar-url'; // Replace with a default image if not available
    };

    return (
        showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg">
                    <h2 className="text-2xl mb-4  text-center">Dentist Details</h2>

                    {selectedDentist && (
                        <div className="flex flex-col items-center md:flex-row md:items-start">
                            {/* Profile Image */}
                            <div className="w-1/3 flex items-center justify-center mb-4 md:mb-0">
                                <img
                                    src={getProfileImage(selectedDentist.ProfilePicture)}
                                    alt="Dentist"
                                    className="w-40 h-36 rounded-full object-cover"
                                />
                            </div>

                            {/* Details Section */}
                            <div className="w-full md:w-2/3 pl-0 md:pl-4">
                                <p className="mb-2"><strong>Name:</strong> {`${selectedDentist.FirstName} ${selectedDentist.LastName}`}</p>
                                <p className="mb-2"><strong>Contact Number:</strong> {selectedDentist.ContactNumber}</p>
                                <p className="mb-2"><strong>License No:</strong> {selectedDentist.LicenseNo}</p>
                                <p className="mb-2"><strong>Address:</strong> {selectedDentist.Address}</p>
                                <p className="mb-2"><strong>Gender:</strong> {selectedDentist.Gender}</p>
                                <p className="mb-4"><strong>Available:</strong> {selectedDentist.isAvailable ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">

                        <button
                            onClick={handleCloseModal}
                            className="bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white py-2 px-4 rounded"
                        >
                            Close
                        </button>
                        <button
                            className="bg-[#025373] hover:bg-[#03738C] text-white py-2 px-4 rounded"
                            onClick={() => {
                                setisEditmodal(true);
                                setShowModal(false);
                            }}
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default DentistDetailsModal;
