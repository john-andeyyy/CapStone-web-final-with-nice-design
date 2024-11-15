import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ServicesList } from '../../Landing-infopage/Infopagedata';

export default function OurService() {
    const [procedures, setProcedures] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [proceduresPerPage] = useState(12);
    const BASEURL = import.meta.env.VITE_BASEURL;
    const proceduresApiUrl = `${BASEURL}/Procedure/showwithimage`;

    const { data: ServicesData } = ServicesList();

    useEffect(() => {
        if (ServicesData) {
            const availableonly = ServicesData.filter((serv) => serv.available === true)
            setProcedures(availableonly);
            // setProcedures(ServicesData);
        }

    }, [ServicesData]);


    // useEffect(() => {
    //     const fetchProcedures = async () => {
    //         try {
    //             const response = await axios.get(proceduresApiUrl);
    //             setProcedures(response.data);
    //         } catch (error) {
    //             console.error('Error fetching procedures:', error);
    //         }
    //     };

    //     fetchProcedures();
    // }, [proceduresApiUrl]);

    const indexOfLastProcedure = currentPage * proceduresPerPage;
    const indexOfFirstProcedure = indexOfLastProcedure - proceduresPerPage;
    const currentProcedures = procedures.slice(indexOfFirstProcedure, indexOfLastProcedure);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(procedures.length / proceduresPerPage);

    return (
        <div className="relative pt-8">
            {/*<div className="absolute inset-0 bg-[url('/sana.png')] bg-cover bg-center opacity-50"></div>*/}
            <div className="relative min-h-screen">
                <div className="max-w-7xl mx-auto p-8">
                    <div id="title" className="pb-7 text-center">
                        {/* <div className="flex-1 rounded-md mx-5 inline-block"
                            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}> */}
                            <h1 className="text-5xl font-bold uppercase p-2 rounded">
                                Our <span className="text-[#025373]">Services</span>
                            </h1>
                        {/* </div> */}
                    </div>

                    <div id="cards" className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {currentProcedures.map(procedure => (
                            <div key={procedure._id} className="card card-compact bg-[#96D2D9] border border-[#012840] shadow-lg rounded-lg">
                                <figure className="h-48 flex items-center justify-center overflow-hidden">
                                    {procedure.Image ? (
                                        <img
                                            src={`data:image/jpeg;base64,${procedure.Image}`}
                                            alt={procedure.Procedure_name}
                                            className="object-contain mt-5 h-full w-full"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <p>No image available</p>
                                        </div>
                                    )}
                                </figure>

                                <div className="card-body p-4">
                                    <h2 className=" text-xl text-[#025373] text-center font-semibold">{procedure.Procedure_name}</h2>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination controls */}
                    <div className="mt-8 flex justify-center">
                        <div className="btn-group">
                            {[...Array(totalPages).keys()].map(pageNumber => (
                                <button
                                    key={pageNumber + 1}
                                    className={`btn ${currentPage === pageNumber + 1 ? 'btn-active' : ''}`}
                                    onClick={() => handlePageChange(pageNumber + 1)}
                                >
                                    {pageNumber + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
