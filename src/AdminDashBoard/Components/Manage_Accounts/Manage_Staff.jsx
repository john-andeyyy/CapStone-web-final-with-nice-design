import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditStaffModal from './Staff_components/EditStaffModal';
import CreateStaffModal from './Staff_components/CreateStaffModal'; 

const BASEURL = import.meta.env.VITE_BASEURL;

export default function Manage_Staff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState(null);

    const fetchStaff = async () => {
        try {
            const response = await axios.post(`${BASEURL}/Admin/auth/ClinicStaff-List-noimage`);
            const data = response.data;
            const staffList = data.filter((staff) => staff.Role !== 'Admin');
            setStaff(staffList);
            setLoading(false);
        } catch (err) {
            setError('Error fetching staff data');
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredStaff = staff.filter((s) =>
        `${s.FirstName} ${s.LastName} ${s.MiddleName}`
            .toLowerCase()
            .includes(searchQuery)
    );

  

    const handleOpenEditModal = (staffId) => {
        setSelectedStaffId(staffId);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setSelectedStaffId(null);
        setIsEditModalOpen(false);
        fetchStaff(); 
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        fetchStaff(); 
    };

    if (loading) {
        return <div className="text-center py-4 text-xl">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-xl text-red-600">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center pb-4">
                <h1 className="text-2xl font-semibold text-gray-800">Manage Staff</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="p-2 text-white bg-[#025373] hover:bg-[#03738C] rounded w-full sm:w-auto"
                >
                    Add Staff
                </button>
            </div>

            <div className="mb-6 relative flex-grow">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by First, Last, or Middle Name"
                    className="block pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-md focus:outline-none focus:border-blue-500 w-full sm:w-96"
                />
                <div className="absolute left-3 top-3 h-4 w-4 text-gray-500">
                    <span className="material-symbols-outlined">search</span>
                </div>
            </div>

            <div className="overflow-x-auto max-h-[34rem] bg-gray-50 rounded-lg shadow-md">
                <table className="table-auto w-full border-collapse text-sm">
                    <thead className="bg-[#012840] text-white sticky top-0 z-10">
                        <tr>
                            <th className="p-4 text-center border-b">No.</th>
                            <th className="p-4 text-center border-b">Last Name</th>
                            <th className="p-4 text-center border-b">First Name</th>
                            <th className="p-4 text-center border-b hidden md:table-cell">Middle Name</th>
                            <th className="p-4 text-center border-b">Role</th>
                            <th className="p-4 text-center border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.length > 0 ? (
                            filteredStaff.map((staffMember, index) => (
                                <tr
                                    key={staffMember._id}
                                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                        } hover:bg-gray-100 transition`}
                                >
                                    <td className="p-4 text-center">{staffMember._id}</td>
                                    <td className="p-4 text-center">{staffMember.LastName}</td>
                                    <td className="p-4 text-center">{staffMember.FirstName}</td>
                                    <td className="p-4 text-center hidden md:table-cell">
                                        {staffMember.MiddleName || 'N/A'}
                                    </td>
                                    <td className="p-4 text-center">{staffMember.Role}</td>
                                    <td className="p-4 text-center flex justify-center">
                                        <button
                                            className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-full shadow-sm"
                                            onClick={() => handleOpenEditModal(staffMember._id)} title="Edit"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-4 text-center text-gray-600">
                                    No staff found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && (
                <EditStaffModal
                    staffId={selectedStaffId}
                    onClose={handleCloseEditModal}
                    onSave={() => fetchStaff()} 
                />
            )}

            {isCreateModalOpen && (
                <CreateStaffModal
                    onClose={handleCloseCreateModal}
                    onCreate={() => fetchStaff()} 
                />
            )}
        </div>
    );
}
