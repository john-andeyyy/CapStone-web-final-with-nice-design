import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { showToast } from './ToastNotification';

const Modal = ({ isOpen, onClose, onSubmit, editMessage, editFrom, editTo, setEditMessage, setEditFrom, setEditTo }) => {
    if (!isOpen) return null;

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
            <div className="bg-white p-4 rounded shadow-lg max-w-96">
                <h2 className="text-xl font-bold mb-4 text-center">Edit Unavailable Time</h2>
                <p className="textxl text-gray-600">Currently selected: </p>
                <p>From <span className='font-bold'>{formatDate(editFrom)}</span> to <span className='font-bold'>{formatDate(editTo)}</span></p>

                <form onSubmit={onSubmit}>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <label htmlFor="editMessage" className="block mb-1 mt-2 font-semibold">Message:</label>
                            <input
                                id="editMessage"
                                type="text"
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editFromDate" className="block mb-1 font-semibold">From:</label>
                            <input
                                id="editFromDate"
                                type="date"
                                value={editFrom.split('T')[0]} // Use only the date part
                                onChange={(e) => setEditFrom(e.target.value)}
                                className="border rounded px-2 py-1"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editToDate" className="block mb-1 font-semibold">To:</label>
                            <input
                                id="editToDate"
                                type="date"
                                value={editTo.split('T')[0]} // Use only the date part
                                onChange={(e) => setEditTo(e.target.value)}
                                className="border rounded px-2 py-1 mb-2"
                                required
                            />
                        </div>
                        <div className="flex justify-between gap-2">
                            <button type="submit" className="bg-[#025373] hover:bg-[#03738C] text-white px-4 py-1 rounded">
                                Update Unavailable Time
                            </button>
                            <button type="button" onClick={onClose} className="bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white px-4 py-1 rounded">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};


const UnavailableClinic = () => {
    const [unavailableList, setUnavailableList] = useState([]);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [message, setMessage] = useState(''); // State for the message
    const [editId, setEditId] = useState(null);
    const [editMessage, setEditMessage] = useState('');
    const [editFrom, setEditFrom] = useState('');
    const [editTo, setEditTo] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('');
    const [todayButtonVisible, setTodayButtonVisible] = useState(false);
    const BASEURL = import.meta.env.VITE_BASEURL;

    const fetchUnavailableTimes = async () => {
        try {
            const response = await axios.get(`${BASEURL}/clinicClose/unavailable`, { withCredentials: true });
            if (Array.isArray(response.data[0]?.NotAvailable_on)) {
                setUnavailableList(response.data[0].NotAvailable_on);
            } else {
                throw new Error('Response data is not an array');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching unavailable times');
        }
    };

    useEffect(() => {
        fetchUnavailableTimes();
    }, []);

    const addUnavailableTime = async (e) => {
        e.preventDefault();
        const newUnavailable = {
            Message: message || "Untitled",
            from: fromDate,
            to: toDate,
        };

        showToast('success', ' successful!');

        try {
            const response = await axios.post(`${BASEURL}/clinicClose/unavailable`, newUnavailable, { withCredentials: true });
            setFromDate('');
            setToDate('');
            setMessage(''); // Clear the message input after adding
            fetchUnavailableTimes();
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding unavailable time');
        }
    };

    const deleteUnavailableTime = async (id) => {
        try {
            await axios.delete(`${BASEURL}/clinicClose/unavailable/${id}`, { withCredentials: true });
            setUnavailableList((prev) => prev.filter((item) => item._id !== id));
            showToast('success', ' Delete successful!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting unavailable time');
        }
    };

    const initiateEdit = (item) => {
        setEditId(item._id);
        setEditMessage(item.Message);
        setEditFrom(item.from);
        setEditTo(item.to);
        setModalOpen(true);
    };

    const updateUnavailableTime = async (e) => {
        e.preventDefault();
        const updatedUnavailable = {
            Message: editMessage,
            from: editFrom,
            to: editTo,
        };

        try {
            const response = await axios.put(`${BASEURL}/clinicClose/unavailable/${editId}`, updatedUnavailable, { withCredentials: true });
            setUnavailableList((prev) =>
                prev.map((item) => (item._id === editId ? response.data : item))
            );
            setModalOpen(false);
            setEditId(null);
            setEditMessage('');
            setEditFrom('');
            setEditTo('');
            fetchUnavailableTimes();
            showToast('success', ' Updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating unavailable time');
        }
    };

    const formatDateTime = (dateTime) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateTime).toLocaleDateString('en-US', options);
    };

    const years = Array.from({ length: 1 }, (_, i) => selectedYear); // Show current year only
    const months = Array.from({ length: 12 }, (_, i) => i + 1); // January to December

    const handleMonthChange = (e) => {
        setSelectedMonth(Number(e.target.value));
        setTodayButtonVisible(true); // Show today button when changing month
    };

    const handleFromDateChange = (e) => {
        const value = e.target.value;
        setFromDate(value);

        // Ensure "To" date is after "From" date
        if (toDate && new Date(value) >= new Date(toDate)) {
            setToDate('');
        }
    };

    const handleToDateChange = (e) => {
        const value = e.target.value;
        setToDate(value);
    };

    const filteredUnavailableList = selectedMonth
        ? unavailableList.filter(item => new Date(item.from).getMonth() + 1 === selectedMonth && new Date(item.from).getFullYear() === selectedYear)
        : unavailableList;

    const handleTodayClick = () => {
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        setToDate(today);
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth('');
        setTodayButtonVisible(false); // Hide today button after selection
    };

    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-4">Manage Unavailable Times for Clinic</h2>
            {error && <p className="text-red-500">{error}</p>}

            {/* Filter Section */}
            <div className="w-full p-4 rounded-lg overflow-y-auto">
                <div className="pb-7 flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3">
                    <div className="inline-block mb-4">
                        <label htmlFor="month-selector" className="block text-sm font-medium text-gray-700">Select Month:</label>
                        <select
                            id="month-selector"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                        >
                            <option value="">--Select Month--</option>
                            {months.map((month) => (
                                <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>

                    <div className="inline-block mb-4">
                        <label htmlFor="year-selector" className="block text-sm font-medium text-gray-700">Select Year:</label>
                        <select
                            id="year-selector"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    {todayButtonVisible && (
                        <button
                            onClick={handleTodayClick}
                            className="bg-green-500 text-white px-4 py-1 rounded"
                        >
                            Today
                        </button>
                    )}
                </div>
                <form onSubmit={addUnavailableTime}>
                    <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3">
                        <div className="flex-1 mb-4">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message:</label>
                            <input
                                id="message"
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                            />
                        </div>
                        <div className="flex-1 mb-4">
                            <label htmlFor="from" className="block text-sm font-medium text-gray-700">From:</label>
                            <input
                                id="from"
                                type="date"
                                value={fromDate}
                                onChange={handleFromDateChange}
                                className="border rounded px-2 py-1 w-full"
                                required
                            />
                        </div>
                        <div className="flex-1 mb-4">
                            <label htmlFor="to" className="block text-sm font-medium text-gray-700">To:</label>
                            <input
                                id="to"
                                type="date"
                                value={toDate}
                                onChange={handleToDateChange}
                                className="border rounded px-2 py-1 w-full"
                                required
                            />
                        </div>
                        <button type="submit" className="bg-[#025373] hover:bg-[#03738C] text-white px-4 py-1 rounded">
                            Add Unavailable Time
                        </button>
                    </div>
                </form>
            </div>

            {/* Unavailable Times List */}
            <div className="mt-4 ">
                <h3 className="text-lg font-bold mb-2">Unavailable Times</h3>
                <div className='overflow-y-auto max-h-96'>
                    <table className="w-full border-collapse border border-gray-300 ">
                        <thead>
                            <tr>
                                <th className="text-white border border-black px-4 py-2 sticky top-0 bg-[#012840]">Message</th>
                                <th className="text-white border border-black px-4 py-2 sticky top-0 bg-[#012840]">From</th>
                                <th className="text-white border border-black px-4 py-2 sticky top-0 bg-[#012840]">To</th>
                                <th className="text-white border border-black px-4 py-2 sticky top-0 bg-[#012840]">Actions</th>
                            </tr>

                        </thead>
                        <tbody>
                            {filteredUnavailableList.map((item) => (
                                <tr key={item._id}>
                                    <td className="border border-black bg-white  px-4 py-2">{item.Message}</td>
                                    <td className="border border-black bg-white px-4 py-2">{formatDateTime(item.from)}</td>
                                    <td className="border border-black bg-whitepx-4 py-2">{formatDateTime(item.to)}</td>
                                    <td className="border border-gray-600 bg-white px-4 py-2 flex justify-center gap-2 ">
                                        <button onClick={() => initiateEdit(item)} className=" flex flex-col items-center justify-center w-10 bg-gray-200 text-gray-500 hover:text-gray-600 transition rounded-lg shadow-sm" title='Edit'>
                                            <span className="material-symbols-outlined text-lg" aria-hidden="true">edit</span></button>
                                        <button onClick={() => deleteUnavailableTime(item._id)} className="flex flex-col items-center justify-center w-10 bg-red-100 text-red-500 hover:text-red-600 transition rounded-lg shadow-sm" title='Delete'>
                                            <span className="material-symbols-outlined">
                                                delete
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={updateUnavailableTime}
                editMessage={editMessage}
                editFrom={editFrom}
                editTo={editTo}
                setEditMessage={setEditMessage}
                setEditFrom={setEditFrom}
                setEditTo={setEditTo}
            />
        </div>
    );
};

export default UnavailableClinic;
