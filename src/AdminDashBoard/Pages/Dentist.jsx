import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '../../AdminDashBoard/Components/ToastNotification';
import UnavailableDentist from '../Components/Dentist/UnavailableDentist';
import DentistEdit from '../Components/Dentist/Dentist_edit';
import { alignProperty } from '@mui/material/styles/cssUtils';
import CreateDentist from '../Components/Dentist/CreateDentist';
import DentistDetailsModal from '../Components/Dentist/DentistDetailsModal';
import DentistTable from '../Components/Dentist/DentistTable';
import Swal from 'sweetalert2';

export default function Dentist() {
    const BASEURL = import.meta.env.VITE_BASEURL;
    const navigate = useNavigate();
    const [dentists, setDentists] = useState([]);
    const [selectedDentist, setSelectedDentist] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('available');
    const [isEditmodal, setisEditmodal] = useState(false);



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
        Email: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchDentistList = async () => {
        // setLoading(true);
        Swal.fire({
            title: 'Loading Please Wait',
            html: 'Please wait',
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        try {
            const response = await axios.get(`${BASEURL}/dentist/dentistlist`, {
                withCredentials: true
            });
            setDentists(response.data);
            setError('');
            Swal.close();

        } catch (error) {
            setError('Failed to fetch dentist list. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDentistList();
    }, []);

    const handleRowClick = (dentist) => {
        setSelectedDentist(dentist);
        setShowModal(true);
    };


    const handleAddDentist = () => {
        setShowAddModal(true);
    };
    const handleOpenAddModal = () => {
        setShowAddModal(true);
    };

    const handleOpenModal = (dentist) => {
        setSelectedDentist(dentist);
        setShowModal(true);
    };


    const handleCloseModal = () => {
        setShowModal(false);
        setisEditmodal(false);
    };

    const [errorMessage, seterrorMessage] = useState('')

    const handleCreateDentist = async (dentistData) => {
        // e.preventDefault();

        // Check for empty required fields
        // if (!newDentist.FirstName || !newDentist.LastName || !newDentist.ContactNumber || !newDentist.LicenseNo) {
        //     alert('Please fill out all required fields.');
        //     return; // Exit the function early
        // }
        console.log('newDentist', dentistData)

        const formData = new FormData();
        formData.append('FirstName', dentistData.FirstName);
        formData.append('LastName', dentistData.LastName);
        formData.append('MiddleName', dentistData.MiddleName);
        formData.append('ContactNumber', dentistData.ContactNumber);
        formData.append('Address', dentistData.Address);
        formData.append('Gender', dentistData.Gender);
        formData.append('LicenseNo', dentistData.LicenseNo);
        formData.append('Username', dentistData.Username);
        formData.append('Password', dentistData.Password);
        formData.append('Email', dentistData.Email);
        formData.append('ProfilePicture', dentistData.ProfilePicture);

        try {
            const response = await axios.post(`${BASEURL}/dentist/create`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {

                const createdDentist = {
                    ...dentistData, // Spread the existing data
                    _id: response.data.data._id, // Assuming the API returns the new ID
                    isAvailable: true // Default value if needed, adjust according to your logic
                };

                setDentists((prevDentists) => [...prevDentists, createdDentist]);


                showToast('success', 'Dentist added successfully!');
                setShowAddModal(false);
                // Reset state
                setNewDentist({
                    FirstName: '',
                    LastName: '',
                    MiddleName: '',
                    ContactNumber: '',
                    Address: '',
                    Gender: '',
                    LicenseNo: '',
                    ProfilePicture: null
                });
                // Re-fetch the dentist list
                // fetchDentistList();
            } else {
                alert('Failed to add dentist. Please try again.');
            }
        } catch (error) {
            console.error('Error adding dentist:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred.';
            // alert(errorMessage);
            seterrorMessage(errorMessage)
        }
    };

    const handleCloseAddModal = () => {
        setNewDentist({
            FirstName: '',
            LastName: '',
            MiddleName: '',
            ContactNumber: '',
            Address: '',
            Gender: '',
            LicenseNo: '',
            ProfilePicture: null
        });
        setShowAddModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "ContactNumber" && value.length > 11) return;

        if (e.target.name === 'ProfilePicture') {
            const file = e.target.files[0];
            setNewDentist({ ...newDentist, ProfilePicture: file });

            // Create a URL for the preview
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
        } else {
            setNewDentist({ ...newDentist, [e.target.name]: e.target.value });
        }
    };

    const handle_availability = (userid) => {
        const currentstatus = userid.isAvailable;
        const newStatus = !currentstatus;

        const payload = {
            Status: newStatus,
        };

        axios.put(`${BASEURL}/dentist/Dentistdata/tongleavailable/${userid._id}`, payload, {
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200) {
                    const updatedDentist = dentists.find(dentist => dentist._id === userid._id);
                    if (updatedDentist) {
                        updatedDentist.isAvailable = newStatus;
                    }
                    setDentists([...dentists]);
                    showToast('success', 'Availability updated successfully!');
                } else {
                    console.warn('Unexpected response status:', response.status);
                }
            })
            .catch((error) => {
                console.error("Error updating availability:", error);
                alert('Failed to update availability. Please try again.');
            });
    };

    const updateDentistData = () => {
        fetchDentistList()
    };


    const filteredDentists = dentists
        .filter((dentist) => {
            // Filter by name
            const matchesName = `${dentist.FirstName} ${dentist.LastName}`.toLowerCase().includes(filterText.toLowerCase());

            // Filter by availability
            const matchesAvailability =
                availabilityFilter === 'all' ||
                (availabilityFilter === 'available' && dentist.isAvailable) ||
                (availabilityFilter === 'unavailable' && !dentist.isAvailable);

            return matchesName && matchesAvailability;
        })
        .sort((a, b) => {
            const nameA = `${a.FirstName} ${a.LastName}`.toLowerCase();
            const nameB = `${b.FirstName} ${b.LastName}`.toLowerCase();
            return nameA.localeCompare(nameB); // Compare the names alphabetically (A to Z)
        });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDentistId, setSelectedDentistId] = useState('');

    const openModal = (dentistId) => {
        setSelectedDentistId(dentistId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDentistId(''); // Clear selected dentist ID
    };
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-10">Dentist List</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <div className="flex justify-between mb-4 ">
                <div className='flex space-x-3'>
                    <div className="flex flex-col lg:flex-row space-x-0 lg:space-x-4 w-full lg:w-auto space-y-2">
                        <div className='relative w-full'>
                            <input
                                type="text"
                                placeholder="Search Dentist"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="block w-full bg-gray-100 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                            />
                            <div className='absolute left-3 top-3 h-4 w-4 text-gray-500'>
                                <span className="material-symbols-outlined">search</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row space-x-0 lg:space-x-4 w-full lg:w-auto space-y-2">
                        {/* Filter by availability */}
                        <select
                            value={availabilityFilter}
                            onChange={(e) => setAvailabilityFilter(e.target.value)}
                            className="p-2 rounded-lg bg-gray-100 border w-full lg:w-auto"
                        >
                            <option value="all">All</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>
                </div>


                {localStorage.getItem('Role') == 'admin' && (
                    <button className="bg-[#025373] hover:bg-[#03738C] py-2 px-4 rounded-lg text-white" onClick={handleAddDentist}>
                        Add Dentist
                    </button>
                )}
            </div>

            <DentistTable
                loading={loading}
                filteredDentists={filteredDentists}
                handleRowClick={handleRowClick}
                handle_availability={handle_availability}
                openModal={openModal}
                closeModal={closeModal}
                isModalOpen={isModalOpen}
                selectedDentistId={selectedDentistId}
            />

            {isEditmodal && (
                <DentistEdit
                    isOpen={isEditmodal}
                    onClose={() => setisEditmodal(false)}
                    selectedDentist={selectedDentist}
                    updateDentistData={updateDentistData}
                />
            )}

            <CreateDentist
                showAddModal={showAddModal}
                handleCreateDentist={handleCreateDentist}
                handleCloseAddModal={handleCloseAddModal}
                newNewDentistData={setNewDentist}
                errorMessage={errorMessage}

            />

            <DentistDetailsModal
                showModal={showModal}
                selectedDentist={selectedDentist}
                setisEditmodal={setisEditmodal}
                setShowModal={setShowModal}
                handleCloseModal={handleCloseModal}
            />
        </div>
    );
}
