import React, { useState } from 'react';
import axios from 'axios';
import SemiFullModal from '../../../../ComponentModal/MediumModal';
import Swal from 'sweetalert2';

const NotesModal = ({ isOpen, onClose, toothName, toothStatus, notes, patientId, toothId, jaw, onRefresh, selectedTooth }) => {
    const [notelist, setNotelist] = useState(notes);
    const [newNote, setNewNote] = useState('');
    const [noteIndexToUpdate, setNoteIndexToUpdate] = useState(null);
    const [updatedNote, setUpdatedNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isEditingTooth, setIsEditingTooth] = useState(false);
    const [teethname, setteethname] = useState(toothName);
    const [showDeleteToothConfirmation, setShowDeleteToothConfirmation] = useState(false);
    const [showDeleteNoteConfirmation, setShowDeleteNoteConfirmation] = useState({ show: false, index: null });
    const [toothType, setToothType] = useState(selectedTooth.toothType);
    const [toothDetails, setToothDetails] = useState({ name: toothName, status: toothStatus, toothType: selectedTooth.toothType });
    const [backupToothDetails, setBackupToothDetails] = useState({ name: toothName, status: toothStatus, toothType: selectedTooth.toothType });

    const Baseurl = import.meta.env.VITE_BASEURL;

    if (!isOpen) return null;

    const handleAddNote = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${Baseurl}/tooth2dmodel/add-note`, {
                patientId,
                toothId,
                jaw,
                note: newNote,
            });

            if (response.data && response.data.notes) {
                setNotelist([...response.data.notes]);
                console.log('response.data.notes', response.data.notes)
                setNewNote('')
                setIsAddingNote(false)
            } else {
                setError('Invalid response format');
            }
            setNotelist({ note: response.data.notes });
            await onRefresh();
        } catch (error) {
            console.error('Error adding note:', error);
            setError('An error occurred while adding the note.');
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateNote = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.put(`${Baseurl}/tooth2dmodel/update-note`, {
                patientId,
                toothId,
                jaw,
                noteIndex: noteIndexToUpdate,
                updatedNote,

            });
            setUpdatedNote('');
            setNotelist({ note: response.data.note });
            setNoteIndexToUpdate(null);
            await onRefresh();
        } catch (error) {
            console.error('Error updating note:', error);
            setError('An error occurred while updating the note.');
        } finally {
            setLoading(false);
        }
    };


    const confirmDeleteNote = (index) => {
        setShowDeleteNoteConfirmation({ show: true, index });
    };

    const handleDeleteNote = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.delete(`${Baseurl}/tooth2dmodel/delete-note`, {
                data: {
                    patientId,
                    toothId,
                    jaw,
                    noteIndex: showDeleteNoteConfirmation.index,
                },
            });

            if (response.data && response.data.note) {
                setNotelist({ note: response.data.note });
            } else {
                setError('Invalid response format');
            }

            await onRefresh();
        } catch (error) {
            console.error('Error deleting note:', error);
            setError('An error occurred while deleting the note.');
        } finally {
            setLoading(false);
            setShowDeleteNoteConfirmation({ show: false, index: null });
        }
    };



    const confirmDeleteTooth = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this tooth? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteTooth();
            }
        });
    };

    const handleDeleteTooth = async () => {
        setLoading(true);
        setError('');
        try {
            await axios.delete(`${Baseurl}/tooth2dmodel/teeth/delete`, {
                data: {
                    patientId,
                    toothId,
                },
            });
            setSuccessMessage(`${toothDetails.name} deleted successfully.`);

            Swal.fire(
                'Deleted!',
                'The tooth has been deleted.',
                'success'
            );

            onClose();
            await onRefresh();
        } catch (error) {
            console.error('Error deleting tooth:', error);
            setError('An error occurred while deleting the tooth.');
        } finally {
            setLoading(false);
            setShowDeleteToothConfirmation(false);  // Hide confirmation prompt
        }
    };

    const handleUpdateToothDetails = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage(''); // Clear any previous success messages
        try {
            const response = await axios.put(`${Baseurl}/tooth2dmodel/update-tooth`, {
                patientId,
                toothId,
                jaw,
                name: toothDetails.name,
                status: toothDetails.status,
                toothType
            });
            setteethname(response.data.name);
            console.log('response.data.name', response.data)
            setToothDetails({
                name: response.data.name,
                status: response.data.status,
                toothType: response.data.toothType

            });

            setIsEditingTooth(false);

            await onRefresh();
        } catch (error) {
            console.error('Error updating tooth details:', error);
            setError('An error occurred while updating tooth details.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        setBackupToothDetails({ ...toothDetails }); // Store the original state before editing
        setIsEditingTooth(true);
    };

    const handleCancelClick = () => {
        // alert(';')

        setToothDetails({ ...backupToothDetails });
        setIsEditingTooth(false);
    };

    return (
        <SemiFullModal
            isOpen={isOpen}
            onClose={onClose}
            w={'50%'}
            h={'80%'}
        >
            <div className=''>
                <div className='text-center text-lg font-semibold '>
                    {loading && <div className="spinner">Loading...</div>}
                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    {successMessage && <div className="text-green-500 mb-2">{successMessage}</div>}
                </div>
                <div className="mb-2 ">
                    <h2 className="text-2xl font-bold text-center uppercase text-[#0082d5]">{teethname} <span className='text-black'>Notes</span></h2>
                </div>

                {/* Tooth Details Section */}
                <div className="mb-4">
                    {isEditingTooth ? (
                        <form onSubmit={handleUpdateToothDetails} className="flex flex-col">
                            <div className="grid grid-cols-2 gap-2">
                            </div>
                            <div className="flex justify-between">
                                <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Save Changes</button>
                                <button
                                    type="button"
                                    onClick={handleCancelClick} // Reset state and exit edit mode
                                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className=" mt-">

                            <div className='flex justify-end'>
                                <button onClick={() => setIsEditingTooth(true)} className="text-blue-500 hover:underline bg-[#B5E5FF] p-5 py-2 rou">Edit</button>
                            </div>
                        </div>
                    )}
                    <div className="mb-2">
                        <label className="block">Status:</label>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                "Healthy",
                                "Caries (Decayed)",
                                "Restored",
                                "Missing",
                                "Extracted",
                                "Impacted",
                                "Fractured",
                                "Erupted",
                                "Partially Erupted",
                                "Endodontically Treated",
                                "Abscessed",
                                "Periodontally Compromised",
                                "Fluorosis-Affected",
                                "Transposed"
                            ].map((status) => (
                                <div key={status} className="flex items-center">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            value={status}
                                            checked={toothDetails.status.includes(status)}
                                            onChange={(e) => {
                                                const newStatus = e.target.checked
                                                    ? [...toothDetails.status, status]
                                                    : toothDetails.status.filter((s) => s !== status);
                                                setToothDetails({ ...toothDetails, status: newStatus });
                                            }}
                                            className={`form-checkbox ${isEditingTooth ? 'checkbox checkbox-error' : 'hidden'} disabled:bg-green-200 disabled:border-gray-400 disabled:text-gray-500`}
                                            disabled={!isEditingTooth}
                                        />
                                        {!isEditingTooth && (
                                            <span className="material-symbols-outlined text-green-500 ml-2">
                                                {toothDetails.status.includes(status) ? 'radio_button_checked' : 'radio_button_unchecked'}
                                            </span>
                                        )}
                                        <span className="ml-2">{status}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-2 mt-5'>
                    <h2 className="text-xl font-bold">Notes:</h2>
                    {/* Toggle button for adding a new note */}
                    <button
                        onClick={() => {
                            setIsAddingNote(!isAddingNote)
                            setNewNote('')
                        }}
                        className={`px-4 py-2 rounded text-white transition ${isAddingNote ? 'bg-[#D9D9D9] hover:bg-[#ADAAAA]' : 'bg-[#00a4f8] hover:bg-[#2bbcff]'}`}
                    >
                        {isAddingNote ? 'Cancel' : 'Add New Note'}
                    </button>

                </div>

                {/* Add New Note Section */}
                <div className="flex items-center mb-4 w-full mt-5">
                    {isAddingNote && <h1 className="text-xl font-bold mr-4">Create:</h1>}
                    {/* Form for adding a new note */}
                    {isAddingNote && (
                        <form onSubmit={handleAddNote} className="flex flex-grow mr-4">
                            <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="border border-gray-300 p-2 text-sm flex-grow rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                                placeholder="Type your note here..."
                            />
                            <button
                                type="submit"
                                className={`ml-2 px-4 py-2 bg-[#4285F4] hover:bg-[#0C65F8] text-white rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Note'}
                            </button>
                        </form>
                    )}

                    {/* Toggle button for adding a new note
                    <button
                        onClick={() => setIsAddingNote(!isAddingNote)}
                        className={`px-4 py-2 rounded text-white transition ${isAddingNote ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                        {isAddingNote ? 'Cancel' : 'Add New Note'}
                    </button> */}
                </div>
                {/* Update Existing Note Section */}
                {noteIndexToUpdate !== null && (
                    <div className='flex w-full items-center mb-4'>
                        Edit
                        <form onSubmit={handleUpdateNote} className="flex flex-grow">
                            <input
                                type="text"
                                value={updatedNote}
                                onChange={(e) => setUpdatedNote(e.target.value)}
                                className="border border-gray-300 ml-3 p-2 text-sm flex-grow rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                                placeholder="Update your note here..."
                            />
                            <button
                                type="submit"
                                className={`ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Note'}
                            </button>
                        </form>
                        <button
                            onClick={() => setNoteIndexToUpdate(null)}
                            className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition "
                        >
                            Cancel
                        </button>
                    </div>
                )}
                <div className={`px-5 overflow-y-auto max-h-96 min-h-20 mb-4 bg-[#b5e5ff] border border-green-200 rounded-md shadow-sm ${notelist.length <= 3 ? '' : 'flex flex-col-reverse'}`}>
                    <ul className="list-disc mb-4 pt-5">
                        {Array.isArray(notelist.note) && notelist.note.length > 0 ? (
                            notelist.note.slice().reverse().map((note, index) => (
                                <li key={note._id} className="mb-2 text-gray-800 flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                    <div >
                                        <p className="flex-1">
                                            {note.text}</p>

                                        <p className="text-gray-500 text-sm">
                                            ({new Date(note.dateCreated).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                hour12: true
                                            })})
                                        </p>
                                    </div>
                                    <div className='flex justify-center gap-2 '>
                                        <button onClick={() => {
                                            setNoteIndexToUpdate(index); // use index for updating specific note
                                            setUpdatedNote(note.text);   // Set updatedNote to note text only
                                        }} className="flex flex-col items-center justify-center w-10 bg-gray-200 text-gray-500 hover:text-gray-600 transition rounded-lg shadow-sm"
                                            title='Edit'> <span className="material-symbols-outlined text-lg" aria-hidden="true">edit</span></button>
                                        <button onClick={() => confirmDeleteNote(index)} className="flex flex-col items-center justify-center w-10 bg-red-100 text-red-500 hover:text-red-600 transition rounded-lg shadow-sm" title='delete'><span className="material-symbols-outlined">
                                            delete
                                        </span></button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-500 text-center">No notes available.</li>
                        )}
                    </ul>
                </div>
                {/* {localStorage.getItem('Role') !== 'dentist' && (
                    <div className="absolute bottom-4 right-4 flex flex-col items-end">
                        <button
                            onClick={confirmDeleteTooth}
                            className={`px-4 py-2 rounded transition ${localStorage.getItem('Role') === 'admin' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                            disabled={localStorage.getItem('Role') !== 'admin'}
                        >
                            Delete Tooth
                            <p className="text-sm font-semibold text-white">Admin only</p>
                        </button>
                    </div>
                )} */}
            </div>
            {/* Delete Note Confirmation Prompt */}
            {showDeleteNoteConfirmation.show && (
                <div className="text-center mb-4">
                    <p>Are you sure you want to delete this note?</p>
                    <div className="flex justify-center mt-2">
                        <button onClick={handleDeleteNote} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Confirm</button>
                        <button onClick={() => setShowDeleteNoteConfirmation({ show: false, index: null })} className="ml-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Cancel</button>
                    </div>
                </div>
            )}


        </SemiFullModal>
    );
};

export default NotesModal;
