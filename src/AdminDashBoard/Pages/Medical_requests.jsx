import { useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import axios from 'axios';
import { showToast } from '../Components/ToastNotification';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function MedicalRequests() {
  const navigate = useNavigate()
  const BASEURL = import.meta.env.VITE_BASEURL;

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [acceptConfirmation, setAcceptConfirmation] = useState(false);
  const [archiveConfirmation, setArchiveConfirmation] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const getAppointments = async () => {
    setLoading(true);
    try {
      // const response = await axios.get(`${BASEURL}/Appointments/appointments/filter`, {
      const response = await axios.get(`${BASEURL}/Appointments/appointments/noimage`, {

        withCredentials: true
      });
      if (response.status === 200) {
        setRequests(response.data);
        console.log('response', response)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const showBasedOnStatus = (status) => {
      switch (status) {
        case 'Pending':
          return request.medcertiStatus === 'Pending';
        case 'Approved':
          return request.medcertiStatus === 'Approved';
        case 'Rejected':
          return request.medcertiStatus === 'Rejected';
        case 'Archive':
          return request.medcertiStatus === 'Archive';
        case 'All':
          return ['Pending', 'Approved', 'Rejected', 'Archive'].includes(request.medcertiStatus);
        default:
          return false;
      }
    };

    return (
      request.patient &&
      request.patient.FirstName &&
      request.patient.FirstName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      showBasedOnStatus(statusFilter)
    );
  });

  const handleDeleteRequest = async (Rejectmsg) => {
    console.error('selectedRequest', selectedRequest)
    console.log('handleDeleteRequest1')
    if (true) {
      console.log('handleDeleteRequest2')

      setActionLoading(true);
      try {
        await axios.put(`${BASEURL}/SendDentalCertificate/6728ec46d9f2751eb0a9b237`, {
          Status: 'Rejected',
          Rejectmsg
        }, {
          withCredentials: true
        });

        showToast('success', `You have rejected the Request!`);

        setRequests(requests.filter((request) => request.id !== selectedRequest.id));
        setDeleteConfirmation(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error deleting request:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Function to confirm deletion
  const confirmDeleteRequest = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      input: "textarea",
      inputLabel: "Reason for Rejection",
      inputPlaceholder: "Type your reason here...",
      inputAttributes: {
        "aria-label": "Type your reason here"
      },
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Reject it!"
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        handleDeleteRequest(result.value);


        Swal.fire({
          title: "Rejected!",
          text: result.value,
          icon: "success"
        });
      } else if (result.isConfirmed && !result.value) {
        Swal.fire("Please provide a reason for rejection.");
      }
    });
  };

  const handleArchiveRequest = async () => {
    console.error('selectedRequest', selectedRequest)
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await axios.put(`${BASEURL}/SendDentalCertificate/${selectedRequest.id}`, {
        Status: 'Archive'
      }, {
        withCredentials: true
      });

      showToast('success', `You have archived the Request!`);

      setRequests(requests.map((request) =>
        request.id === selectedRequest.id ? { ...request, medcertiStatus: 'Archive' } : request
      ));
      setArchiveConfirmation(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error archiving request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Function to confirm archiving
  const confirmArchiveRequest = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, archive it!"
    }).then((result) => {
      if (result.isConfirmed) {
        handleArchiveRequest();
        Swal.fire({
          title: "Archived!",
          text: "Your request has been archived.",
          icon: "success"
        });
      }
    });
  };


  const handleAcceptRequest = (request) => {

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Approved it!"
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirmhandleAcceptRequest(request);

        Swal.fire({
          title: "Approved!",
          text: "You Approved the Request.",
          icon: "success"
        });
      }
    });
  };

  const onConfirmhandleAcceptRequest = async (request) => {
    const selectedRequest = request
    console.log('selectedRequest', selectedRequest)

    setActionLoading(true);
    try {
      await axios.put(`${BASEURL}/SendDentalCertificate/${selectedRequest.id}`, {
        Status: 'Approved'
      }, {
        withCredentials: true
      });

      showToast('success', `You have approved the Request!`);

      setRequests(requests.map((request) =>
        request.id === selectedRequest.id ? { ...request, medcertiStatus: 'Accepted' } : request
      ));
      setAcceptConfirmation(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };


  function downloadPatientMedicalCertificate(request) {
    console.log('req', request)
    const id = request.id
    Swal.fire({
      title: "Fetching Your Certificate",
      text: "We are retrieving your dental certificate. Please wait a moment.",
      icon: "info"
    }).then(() => {
      axios.get(`${BASEURL}/admin/View-DentalCertificate/${id}`, {
        responseType: 'arraybuffer',
        withCredentials: true
      }).then(response => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const newTab = window.open(url, '_blank');

        if (!newTab) {
          Swal.fire({
            title: "Error",
            text: "Failed to open the certificate in a new tab.",
            icon: "error"
          });
        }
      })
        .catch(error => {
          console.error("Axios error:", error);
          Swal.fire({
            title: "Error!",
            text: "An error occurred while fetching the certificate data.",
            icon: "error"
          });
        });
    });
  }




  return (
    <div className="container mx-auto p-4 pt-0">
      <div className="p-4">
        {/* Status Dropdown and Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-4 space-y-4 lg:space-y-0">
          <h1 className="text-2xl font-semibold">Dental Certificate Requests</h1>
        </div>

        {/* Filter by Status */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">

          <div className="relative w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#3EB489]"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500">
              <span className="material-symbols-outlined">search</span>
            </div>
          </div>


          <label htmlFor="status" className="font-semibold">Filter by Status:</label>

          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full lg:w-auto p-2 border border-gray-300 rounded-md"
          >
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="Archive">Archive (delete)</option>
          </select>
        </div>
      </div>

      {/* Request List */}
      <div className="p-2 overflow-x-auto">
        <table className="w-full table-auto bg-gray-100 text-black border border-black">
          <thead>
            <tr className="bg-[#3EB489] border border-black">
              <th className="p-2 font-bold border border-black text-white">Name</th>
              <th className="p-2 font-bold border border-black text-white  hidden sm:table-cell">Date</th>
              <th className="p-2 font-bold  border border-black text-white  hidden sm:table-cell">Procedure</th>
              <th className="p-2 font-bold border border-black text-white">Status</th>
              <th className="p-2 font-bold text-center border border-black text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border border-black">
                <td colSpan={statusFilter !== 'Approved' && statusFilter !== 'All' ? 5 : 4} className="text-center py-20 border border-black">
                  <span className="loading loading-spinner loading-lg"></span>
                </td>
              </tr>
            ) : (
              <>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={statusFilter !== 'Approved' && statusFilter !== 'All' ? 5 : 4} className="p-4 text-center font-bold border border-black">
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="bg-gray-100 cursor-pointer border border-black">
                      {/* Patient's Name */}
                      <td className="p-2 border border-black whitespace-nowrap">{request.patient.FirstName} {request.patient.LastName}</td>

                      {/* Request Date */}
                      <td className="p-2 border border-black ">
                        {new Date(request.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Procedures */}
                      <td className="p-2 border border-black  hidden sm:table-cell">
                        {request.procedures.length > 2
                          ? `${request.procedures.slice(0, 2).map(proc => proc.name).join(', ')} ...`
                          : request.procedures.map(proc => proc.name).join(', ')
                        }
                      </td>

                      {/* Status */}
                      <td className={`p-2 border border-black ${request.medcertiStatus === 'Pending' ? 'text-green-500' : ''}`}>
                        {request.medcertiStatus}
                      </td>

                      {/* Actions */}
                      {statusFilter === 'Approved' && (
                        <td className="text-center p-2 border border-black  hidden sm:table-cell">
                          <button
                            className="flex items-center justify-center w-10 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-lg shadow-sm"
                            onClick={() => navigate(`/appointment/${request.id}`)}
                            title="view"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        </td>
                      )}

                      {statusFilter !== 'Approved' && statusFilter !== 'All' && (
                        <td className="text-center p-2 border border-black  hidden sm:table-cell">
                          <div className="flex justify-center space-x-2">
                            {/* View Button */}
                            <button
                              className="flex items-center justify-center w-10 bg-blue-100 text-blue-500 hover:text-blue-600 transition rounded-lg shadow-sm"
                              onClick={() => navigate(`/appointment/${request.id}`)}
                              title="view"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>

                            {/* Approve Button */}
                            {request.medcertiStatus !== 'Approved' && (
                              <button
                                className="flex items-center justify-center w-10 bg-green-100 text-green-500 hover:text-green-600 transition rounded-lg shadow-sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  handleAcceptRequest(request);
                                }}
                                title="approve"
                              >
                                <span className="material-symbols-outlined">check_circle</span>
                              </button>
                            )}

                            {/* Reject Button */}
                            {request.medcertiStatus !== 'Approved' && request.medcertiStatus !== 'Rejected' && (
                              <button
                                className="flex items-center justify-center w-10 bg-red-100 text-red-500 hover:text-red-600 transition rounded-lg shadow-sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  confirmDeleteRequest();
                                }}
                                title="reject"
                              >
                                <span className="material-symbols-outlined">cancel</span>
                              </button>
                            )}

                            {/* Archive Button */}
                            {request.medcertiStatus !== 'Approved' && request.medcertiStatus !== 'Archive' && (
                              <button
                                className="flex items-center justify-center w-10 bg-gray-200 text-gray-500 hover:text-gray-600 transition rounded-lg shadow-sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  confirmArchiveRequest();
                                }}
                                title="archive"
                              >
                                <span className="material-symbols-outlined">archive</span>
                              </button>
                            )}
                            {/* for dl the medical certi */}
                            <button
                              className="flex items-center justify-center w-10 bg-green-100 text-green-500 hover:text-green-600 transition rounded-lg shadow-sm"
                              onClick={() => {
                                // setSelectedRequest(request);
                                // handleAcceptRequest(request);
                                downloadPatientMedicalCertificate(request)
                              }}
                              title="download"
                            >
                              <span className="material-symbols-outlined">download</span>
                            </button>
                          </div>
                        </td>
                      )}

                    </tr>
                  ))
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>

  );
}
