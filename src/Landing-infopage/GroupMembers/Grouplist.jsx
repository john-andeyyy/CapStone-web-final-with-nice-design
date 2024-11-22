import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { showToast } from '../../AdminDashBoard/Components/ToastNotification';
import AddGroupMember from './AddGroupMember'
export default function Grouplist() {
    const BASEURL = import.meta.env.VITE_BASEURL;
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setisViewModalOpen] = useState(false);
    const [IsAddGroupView, setIsAddGroupView] = useState(false);
    const [viewMode, setViewMode] = useState('card'); // Default view is 'card'

    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [selectedMemberData, setselectedMemberData] = useState('');
    const [isDeleteModalOpen, setisDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        MiddleName: '',
        ContactNumber: '',
        Facebooklink: '',
        ProfilePicture: null, // File input
        Role: '',
        Email: '',
    }); // State to hold form data for editing

    useEffect(() => {
        let isMounted = true; // flag to track component mount status

        const fetchMembers = async () => {
            try {
                const response = await axios.get(`${BASEURL}/members/group-members`);
                if (isMounted) { // only set state if mounted
                    setMembers(response.data);
                    console.log(response.data);
                }
            } catch (err) {
                if (isMounted) {
                    // setError(err.message);
                    alert(err.message);
                }
            } finally {
                if (isMounted) {
                    // setLoading(false);
                }
            }
        };

        fetchMembers();

        return () => {
            isMounted = false; // cleanup function sets isMounted to false
        };
    }, [IsAddGroupView]);

    const getProfileImage = (profilePicture) => {
        if (profilePicture instanceof File) {
            return URL.createObjectURL(profilePicture); // If the image is a new file, create an object URL
        }
        return profilePicture
            ? `data:image/jpeg;base64,${profilePicture}`
            : "https://via.placeholder.com/150";
    };

    // const getProfileImage = (profilePicture) => {
    //     if (profilePicture) {
    //         return `data:image/jpeg;base64,${profilePicture}`;
    //     } else {
    //         return "https://via.placeholder.com/150";
    //     }
    // };

    // Filtered members based on search term
    const filteredMembers = members.filter(member =>
        `${member.FirstName} ${member.LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Function to handle edit click
    // Function to handle edit click
    const handleEditClick = (member) => {
        setSelectedMemberId(member._id);
        // setSelectedMemberData(member);  // Ensure selectedMemberData is set to the clicked member's data
        setFormData({
            FirstName: member.FirstName,
            LastName: member.LastName,
            MiddleName: member.MiddleName || '', // Handle missing middle name
            ContactNumber: member.ContactNumber,
            Facebooklink: member.Facebooklink || '',
            ProfilePicture: member.ProfilePicture || null, // Handle missing profile picture
            Role: member.Role,
            Email: member.Email,
        });
        setIsModalOpen(true); // Open the modal
    };


    // Handle form changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle image upload
    // Handle image upload and preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, ProfilePicture: file });

        // Generate image preview URL
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setselectedMemberData({ ...selectedMemberData, ProfilePicture: previewUrl });
        }
    };

    // Handle form submission for updating member data
    const handleFormSubmit = (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
        });

        axios.put(`${BASEURL}/members/group-members/${selectedMemberId}`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                showToast('success', 'Member updated successfully!');

                setIsModalOpen(false); // Close the modal
                // Optionally refetch the member list to show the updated data
                axios.get(`${BASEURL}/members/group-members`)
                    .then(response => setMembers(response.data));
            })
            .catch(error => {
                alert("Error updating member: " + error.message);
            });
    };

    const handleDelete = (userid) => {
        axios.delete(`${BASEURL}/members/group-members/${userid}`)
            .then(() => {
                setMembers(prevMembers => prevMembers.filter(mem => mem._id !== userid));
                warning('success', 'Member Delete successfully!');

            })
            .catch((error) => {
                alert('Error:', error.message);
            })
            .finally(() => {
                setisDeleteModalOpen(false);
            });
    }

    const addtolist = (new_members) => {
        setMembers(new_members)

    }
    return (
        <div>
            {/* <h1 className='text-2xl font-bold text-[#266D53] p-10'>The DenTeam Members:</h1>

            {/* Search input field *
            <div className="max-w-7xl mx-auto p-8">
                <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md w-full"
                />
            </div> */}

            <div className='flex justify-between items-center p-5'>
                <h1 className='text-3xl font-bold l:text-sm'>The DenTeam Members:</h1>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search members...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='bg-gray-100 shadow-md block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
                    />
                    <div className='absolute left-3 top-3 h-4 w-4 text-gray-500'>
                        <span className="material-symbols-outlined">search</span>
                    </div>

                </div>

            </div>

            {/* Toggle buttons for views */}
            <div className="flex space-x-4 mb-8 ml-5">
                <button
                    onClick={() => setViewMode('card')}
                    className={`px-4 py-2 rounded-md ${viewMode === 'card' ? 'bg-[#025373] text-white' : 'bg-[#03738C] text-white '}`}
                >
                    Card View
                </button>
                <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-md ${viewMode === 'table' ? 'bg-[#025373] text-white' : 'bg-[#03738C] text-white '}`}
                >
                    Table View
                </button>
                <button
                    onClick={() => setIsAddGroupView(true)}
                    className={`px-4 py-2 rounded-md ${IsAddGroupView ? 'bg-[#025373] text-white' : 'bg-[#03738C] text-white '}`}
                >
                    Add Group View
                </button>
            </div>



            {/* Render members based on the selected view */}
            {viewMode === 'table' && (
                <div className="overflow-x-auto max-h-72"> {/* Set your desired max height */}
                    <table className="min-w-full border border-gray-300">
                        <thead className=" text-center text-white">
                            <tr>
                                <th className="p-2 border border-black bg-[#012840] z-10">Name</th>
                                <th className="p-2 border border-black bg-[#012840] z-10">Role</th>
                                <th className="p-2 border border-black bg-[#012840] z-10">Contact Number</th>
                                <th className="p-2 border border-black bg-[#012840] z-10 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map(member => (
                                    <tr key={member._id} className="bg-white hover:bg-gray-100">
                                        <td className=" border border-black pl-10 " data-label="Name">{`${member.FirstName} ${member.LastName}`}</td>
                                        <td className="p-2 border border-black" data-label="Role">{member.Role}</td>
                                        <td className="p-2 border border-black" data-label="Contact Number">{member.ContactNumber}</td>
                                        <td className="p-2 border border-black text-center space-x-3" data-label="Actions">
                                            <div className="flex space-x-2 justify-center items-center">
                                                <button
                                                    onClick={() => {
                                                        setisViewModalOpen(true); // Open the modal
                                                        setselectedMemberData(member); // Set the selected member's data
                                                    }}
                                                    className="flex items-center justify-center w-10 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-lg shadow-sm"
                                                    title="View"
                                                >
                                                    <span className="material-symbols-outlined">visibility</span>
                                                </button>


                                                <button
                                                    onClick={() => {
                                                        handleEditClick(member);
                                                        setselectedMemberData(member);
                                                    }}
                                                    className="flex flex-col items-center justify-center w-10 bg-gray-200 text-gray-500 hover:text-gray-600 transition rounded-lg shadow-sm"
                                                    title='Edit'
                                                >
                                                    <span className="material-symbols-outlined text-lg" aria-hidden="true">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setisDeleteModalOpen(true);
                                                        setselectedMemberData(member);
                                                    }}
                                                    className="flex flex-col items-center justify-center w-10 bg-red-100 text-red-500 hover:text-red-600 transition rounded-lg shadow-sm" title='delete'
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-4">No members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>



            )}

            {viewMode === 'card' && (
                <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map(member => (
                            <div key={member._id} className="card card-compact bg-[#96D2D9] shadow-xl">
                                <div className='text-right pt-3 pr-3'>
                                    <button onClick={() => handleEditClick(member)} className="text-blue-900">Edit</button>
                                </div>



                                <figure>
                                    <img
                                        src={getProfileImage(member.ProfilePicture)}
                                        alt={`${member.FirstName} ${member.LastName}`}
                                        className="object-cover h-48 pt-5"
                                    />
                                </figure>
                                <div className="card-body">
                                    <h1 className="card-title">{`${member.FirstName} ${member.LastName}`}</h1>
                                    <h4>Role: {member.Role}</h4>
                                    <p>Contact Number: {member.ContactNumber}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-center">No members found.</p>
                    )}
                </div>
            )}



            {IsAddGroupView && (
                <div>
                    <AddGroupMember
                        isOpen={IsAddGroupView}
                        onClose={() => setIsAddGroupView(false)}
                        memberlist={members}
                        addtolist={addtolist}
                    />
                </div>
            )}

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-[#ffffff] p-8 rounded-lg shadow-2xl max-w-4xl w-full">
                        <h2 className="text-3xl font-bold mb-6 text-[#00000] text-center">Edit Member</h2>
                        <div className="mb-4 flex justify-center">
                            <img
                                src={getProfileImage(formData.ProfilePicture)}
                                alt={`${selectedMemberData.FirstName} ${selectedMemberData.LastName}`}
                                className="w-40 h-full object-cover rounded-md"
                            />
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-lg text-black font-semibold mb-1">First Name:</label>
                                    <input
                                        type="text"
                                        name="FirstName"
                                        value={formData.FirstName}
                                        onChange={handleInputChange}
                                        className="bg-gray-100 shadow-md w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-300 outline-none transition duration-200"
                                        placeholder="Enter first name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-black font-semibold mb-1">Last Name:</label>
                                    <input
                                        type="text"
                                        name="LastName"
                                        value={formData.LastName}
                                        onChange={handleInputChange}
                                        className="bg-gray-100 shadow-md  w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-300 outline-none transition duration-200"
                                        placeholder="Enter last name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-black font-semibold mb-1">Middle Name:</label>
                                    <input
                                        type="text"
                                        name="MiddleName"
                                        value={formData.MiddleName}
                                        onChange={handleInputChange}
                                        className="bg-gray-100 shadow-md  w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-300 outline-none transition duration-200"
                                        placeholder="Enter middle name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-black font-semibold mb-1">Contact Number:</label>
                                    <input
                                        type="text"
                                        name="ContactNumber"
                                        value={formData.ContactNumber}
                                        onChange={handleInputChange}
                                        className="bg-gray-100 shadow-md  w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-300 outline-none transition duration-200"
                                        placeholder="Enter contact number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-black font-semibold mb-1">Facebook Link:</label>
                                    <input
                                        type="text"
                                        name="Facebooklink"
                                        value={formData.Facebooklink}
                                        onChange={handleInputChange}
                                        className="bg-gray-100 shadow-md  w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-300 outline-none transition duration-200"
                                        placeholder="Enter Facebook link"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-black font-semibold mb-1">Profile Picture:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        name="ProfilePicture"
                                        onChange={handleImageChange}
                                        className="bg-gray-100 shadow-md  w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-300 outline-none transition duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-black font-semibold mb-1">Role:</label>
                                    <input
                                        type="text"
                                        name="Role"
                                        value={formData.Role}
                                        onChange={handleInputChange}
                                        className="bg-gray-100 shadow-md  w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-300 outline-none transition duration-200"
                                        placeholder="Enter role"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-black font-semibold mb-1">Email:</label>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email}
                                        onChange={handleInputChange}
                                        className="bg-gray-100 shadow-md  w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-300 outline-none transition duration-200"
                                        placeholder="Enter email"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white rounded-lg  transition duration-300 ease-in-out"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3  bg-[#025373] hover:bg-[#03738C] text-white rounded-lg  transition duration-300 ease-in-out"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}




            {/* //! DELETE */}
            {isDeleteModalOpen && selectedMemberData && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-[#C6E4DA] p-8 rounded-md shadow-lg max-w-lg w-full">
                        <h1 className="text-[#266D53]  text-center font-bold text-xl mb-4">Delete Confirmation</h1>
                        <div className="mb-6 text-center">
                            <h2 className="text-lg">
                                Are you sure you want to delete the group member{" "}
                                <span className="font-semibold">{selectedMemberData.FirstName}</span>?
                            </h2>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setisDeleteModalOpen(false)}
                                className="px-4 py-2 bg-[#D9D9D9] hover:bg-[#ADAAAA]text-gray-700 rounded-md "
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(selectedMemberData._id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isViewModalOpen && selectedMemberData && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-[#ffffff] p-8 rounded-md shadow-lg max-w-lg w-full">
                        <div className="relative">
                            <h2 className="text-xl text-[#00000] text-center font-bold mb-4">
                                Member Details
                            </h2>

                            <span
                                className="material-symbols-outlined absolute top-0 right-0 cursor-pointer p-2"
                                onClick={() => setisViewModalOpen(false)}
                            >
                                close
                            </span>
                        </div>

                        {/* Display profile picture if it exists */}
                        <div className="mb-4 flex justify-center">
                            <img
                                src={getProfileImage(selectedMemberData.ProfilePicture)}
                                alt={`${selectedMemberData.FirstName} ${selectedMemberData.LastName}`}
                                className="w-40 h-full object-cover rounded-md"
                            />
                        </div>

                        <div className="mb-2">
                            <strong>First Name:</strong> {selectedMemberData.FirstName}
                        </div>
                        <div className="mb-2">
                            <strong>Last Name:</strong> {selectedMemberData.LastName}
                        </div>
                        <div className="mb-2">
                            <strong>Middle Name:</strong> {selectedMemberData.MiddleName || 'N/A'}
                        </div>
                        <div className="mb-2">
                            <strong>Contact Number:</strong> {selectedMemberData.ContactNumber}
                        </div>
                        <div className="mb-2">
                            <strong>Facebook Link:</strong> {selectedMemberData.Facebooklink || 'N/A'}
                        </div>
                        <div className="mb-2">
                            <strong>Role:</strong> {selectedMemberData.Role}
                        </div>
                        <div className="mb-2">
                            <strong>Email:</strong> {selectedMemberData.Email}
                        </div>

                        {/* <div className="flex justify-end">
                            <button
                                onClick={() => setisViewModalOpen(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                            >
                                Close
                            </button>
                        </div> */}
                    </div>
                </div>
            )}

        </div>
    );
}
