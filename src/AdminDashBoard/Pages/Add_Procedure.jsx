import React from 'react';
import { useState, useEffect } from 'react';
import Modal from '../Components/Modal';
import axios from 'axios';
import { showToast } from '../Components/ToastNotification';
import Swal from 'sweetalert2';
import ProcedureTable from '../Components/Procedures/ProcedureTable';
import ProcedureViewModal from '../Components/Procedures/ProcedureViewModal';
import ProcedureEditModal from '../Components/Procedures/ProcedureEditModal';
import ProcedureAddModal from '../Components/Procedures/ProcedureAddModal';

export default function Add_Procedure() {
  const BASEURL = import.meta.env.VITE_BASEURL;
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [editProcedureModalOpen, setEditProcedureModalOpen] = useState(false);
  const [viewProcedureModalOpen, setViewProcedureModalOpen] = useState(false);
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
  const [procedureToEdit, setProcedureToEdit] = useState(null);
  const [procedureToDelete, setProcedureToDelete] = useState(null);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState(true);
  const [procedureList, setProcedureList] = useState([]);
  const [newProcedure, setNewProcedure] = useState({ _id: '', Procedure_name: '', Duration: '', Price: '', Description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const localrole = localStorage.getItem('Role')

  useEffect(() => {

    const fetchProcedures = async () => {
      try {
        // Show SweetAlert loading spinner
        Swal.fire({
          title: 'Loading Please Wait',
          html: 'Please wait',
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await axios.get(`${BASEURL}/Procedure/show`, {
          withCredentials: true
        });

        // Close the SweetAlert loading spinner once the request is completed
        Swal.close();

        if (Array.isArray(response.data)) {
          const sortedProcedures = sortProceduresAlphabetically(response.data);
          setProcedureList(sortedProcedures);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        // Close the SweetAlert loading spinner on error
        Swal.close();
        console.error('Error fetching procedures:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while fetching procedures. Please try again.',
        });
      }
    };

    fetchProcedures();
  }, [BASEURL]);



  const openEditProcedureModal = (procedure, mode) => {
    setProcedureToEdit(procedure);
    setNewProcedure({ ...procedure });
    if (mode === 'Edit') {
      setEditProcedureModalOpen(true);
    } else if (mode === 'View') {
      setViewProcedureModalOpen(true);
    }
  };
  const openViewModal = (procedure) => {
    console.log('procedure', procedure)
    setSelectedProcedure(procedure);
    setViewProcedureModalOpen(true);
  };
  const closeViewModal = () => {
    setViewProcedureModalOpen(false);
    setSelectedProcedure(null);
  };

  const openEditModal = (procedure) => {
    setNewProcedure(procedure);
    setEditProcedureModalOpen(true);
  };
  const closeEditModal = () => {
    setEditProcedureModalOpen(false);
    setNewProcedure({});
    setImagePreview(null);
  };
  const closeAddModal = () => {
    setAddPatientModalOpen(false);
    setNewProcedure({
      Procedure_name: '',
      Duration: 0,
      Price: '',
      Description: '',
      Image: null,
    });
    setImagePreview(null);
  };
  const openAddModal = () => {
    setAddPatientModalOpen(true);
  };


  const confirmToggleStatus = async (procedure, status) => {
    const statusText = status ? 'available' : 'unavailable';

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to make this procedure ${statusText}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: status ? "#025373" : "#03738C",
        cancelButtonColor: "#ADAAAA",
        reverseButtons: true,
        confirmButtonText: `Yes, mark as ${statusText}`
      });

      if (result.isConfirmed) {
        // Update the procedure status in the database
        await axios.put(`${BASEURL}/Procedure/updatestatus/${procedure._id}`, { status }, { withCredentials: true });

        // Update the procedure list with the new status
        setProcedureList((prevProcedureList) =>
          prevProcedureList.map((p) =>
            p._id === procedure._id ? { ...p, available: status } : p
          )
        );
        // showToast('success', 'Status updated successfully!');
        Swal.fire({
          title: 'Status Updated!',
          text: `The procedure is now marked as ${statusText}.`,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
      showToast('error', `Error updating procedure status: ${error.message}`);
      console.error('Error updating procedure status:', error);
    }
  };

  const confirmtongleStatus = async (status) => {
    try {
      await axios.put(`${BASEURL}/Procedure/updatestatus/${procedureToDelete._id}`,
        { status },
        { withCredentials: true }
      );

      // Update the procedure list with the new status
      setProcedureList((prevProcedureList) =>
        prevProcedureList.map((procedure) =>
          procedure._id === procedureToDelete._id
            ? { ...procedure, available: status } // Update the available status
            : procedure
        )
      );

      showToast('success', 'Status updated successfully!');
      setDeleteConfirmationModalOpen(false);
      setProcedureToDelete(null);
    } catch (error) {
      showToast('error', 'Error updating procedure status:', error);
      console.error('Error updating procedure status:', error);
    }
  };


  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Procedure_name', newProcedure.Procedure_name);
    formData.append('Duration', newProcedure.Duration);
    formData.append('Price', newProcedure.Price);
    formData.append('Description', newProcedure.Description);
    if (newProcedure.Image) {
      formData.append('Image', newProcedure.Image);
    }

    try {
      const response = await axios.post(`${BASEURL}/Procedure/add`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        showToast('success', response.data.message || 'Procedure added successfully!');
        setProcedureList([...procedureList, response.data.procedure]);
        closeAddModal()
        setAddPatientModalOpen(false);

      } else {
        showToast('error', response.data.message || 'Something went wrong.');
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'An error occurred.');
    }

  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Procedure_name', newProcedure.Procedure_name);
    formData.append('Duration', newProcedure.Duration);
    formData.append('Price', newProcedure.Price);
    formData.append('Description', newProcedure.Description);
    if (newProcedure.Image) {
      formData.append('Image', newProcedure.Image);
    }

    try {
      const response = await axios.put(`${BASEURL}/Procedure/update/${newProcedure._id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        showToast('success', 'Procedure updated successfully!');
        setProcedureList((prev) =>
          prev.map((procedure) =>
            procedure._id === newProcedure._id ? newProcedure : procedure
          )
        );
      }
      setEditProcedureModalOpen(false);
      setProcedureToEdit(null);
    } catch (error) {
      showToast('error', error.response?.data?.message || 'An error occurred.');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const filteredProcedures = procedureList.filter((procedure) =>
    procedure.Procedure_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProfileImage = (profilePicture) => {

    if (profilePicture) {
      return `data:image/jpeg;base64,${profilePicture}`;
    } else {
      return "https://via.placeholder.com/150";
    }
  };

  const filteredAndAvailableProcedures = filteredProcedures
    .filter((procedure) => {
      if (availabilityFilter === null) return true;
      return procedure.available === availabilityFilter;
    })
    .sort((a, b) => a.Procedure_name.localeCompare(b.Procedure_name, undefined, { sensitivity: 'base' }));
  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} hrs ${minutes} mins`;
    } else {
      return `${minutes} mins`;
    }
  };
  const sortProceduresAlphabetically = (procedures) => {
    return procedures.sort((a, b) =>
      a.Procedure_name.localeCompare(b.Procedure_name, undefined, { sensitivity: 'base' })
    );
  };
  return (
    <div className='container mx-auto text-sm lg:text-md mt-5'>
      <div>
        <div className='flex justify-between items-center '>
          <h1 className='text-3xl font-bold l:text-sm'>Procedure List</h1>
          <div className='relative'>

            {localrole == 'admin' && (
              <button className='btn bg-[#025373] hover:bg-[#03738C] text-white  md:ml-auto' onClick={openAddModal}>
                Create Procedure
              </button>
            )}

          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mb-4 py-5 md:flex md:items-center md:justify-between">

          {/* Search Input */}
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search procedures..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#3EB489]"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500">
              <span className="material-symbols-outlined">search</span>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-2 md:space-y-0 md:ml-auto">
            <button
              className={`btn ${availabilityFilter === true ? 'bg-[#025373] hover:bg-[#03738C] text-white' : 'bg-[#012840] bg-opacity-35 hover:bg-[#03738C]'}`}
              onClick={() => setAvailabilityFilter(true)}
            >
              Show Available
            </button>
            <button
              className={`btn ${availabilityFilter === false ? 'bg-[#025373] hover:bg-[#03738C] text-white' : 'bg-[#012840] bg-opacity-35 hover:bg-[#03738C]'}`}
              onClick={() => setAvailabilityFilter(false)}
            >
              Show Not Available
            </button>
            <button
              className={`btn ${availabilityFilter === null ? 'bg-[#025373] hover:bg-[#03738C] text-white' : 'bg-[#012840] bg-opacity-35 hover:bg-[#03738C]'}`}
              onClick={() => setAvailabilityFilter(null)}
            >
              Show All
            </button>
          </div>
        </div>


        {/* table */}
        <ProcedureTable
          procedures={filteredAndAvailableProcedures}
          formatDuration={formatDuration}
          openEditProcedureModal={openEditProcedureModal}
          confirmToggleStatus={confirmToggleStatus}
          openViewModal={openViewModal}
          openEditModal={openEditModal}
        />
      </div>

      {/* Add Modal */}
      <ProcedureAddModal
        isOpen={addPatientModalOpen}
        closeModal={closeAddModal}
        newProcedure={newProcedure}
        setNewProcedure={setNewProcedure}
        handleAddSubmit={handleAddSubmit}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
      />

      {/* Edit Modal */}
      <ProcedureEditModal
        isOpen={editProcedureModalOpen}
        closeModal={closeEditModal}
        procedure={newProcedure}
        setProcedure={setNewProcedure}
        handleEditSubmit={handleEditSubmit}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
      />


      {/* View Modal */}
      <ProcedureViewModal
        isOpen={viewProcedureModalOpen}
        closeModal={closeViewModal}
        procedure={selectedProcedure}
        formatDuration={formatDuration}
        getProfileImage={getProfileImage}
      />


      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmationModalOpen} close={() => setDeleteConfirmationModalOpen(false)}>
        <h3 className="font-bold text-lg text-center text-[#266D53] mb-5">Confirmation</h3>
        <p className=" text-center">
          Are you sure you want to make this procedure {procedureToDelete?.available ? 'unavailable' : 'available'}?
        </p>
        <p className="text-center text-lg mt-5">{procedureToDelete?.Procedure_name}</p>
        <div className="modal-action flex justify-center">

          {procedureToDelete && procedureToDelete.available ? (
            <button
              type="button"
              className="btn bg-red-500 hover:bg-red-600"
              onClick={() => confirmtongleStatus(false)}
            >
              Mark as Unavailable
            </button>
          ) : (
            <button
              type="button"
              className="btn bg-[#4285F4] hover:bg-[#0C65F8]"
              onClick={() => confirmtongleStatus(true)}
            >
              Mark as Available
            </button>
          )}
          <button
            type="button"
            className="btn bg-[#D9D9D9] hover:bg-[#ADAAAA]"
            onClick={() => setDeleteConfirmationModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
