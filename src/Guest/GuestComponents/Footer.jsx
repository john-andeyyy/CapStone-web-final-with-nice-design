import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios

export default function Footer() {
    const [clinicDetails, setClinicDetails] = useState(null);
    const BASEURL = import.meta.env.VITE_BASEURL;
    const contactApiUrl = `${BASEURL}/Contactus/contactus`;

    // Fetch clinic details from the API
    useEffect(() => {
        const fetchClinicDetails = async () => {
            try {
                const response = await axios.get(contactApiUrl); // Use axios to fetch data
                if (response.data.length > 0) {
                    setClinicDetails(response.data[0]); // Set the first clinic detail
                }
            } catch (error) {
                console.error('Error fetching clinic details:', error);
            }
        };

        fetchClinicDetails();
    }, [contactApiUrl]); // Dependency array

    if (!clinicDetails) {
        return <div className="text-center">Loading...</div>; // Loading state
    }

    const getProfileImage = (profilePicture) => {
        if (profilePicture) {
            return `data:image/jpeg;base64,${profilePicture}`; // Adjust to image format (jpeg/png)
        } else {
            return "https://via.placeholder.com/150"; // Fallback if no image
        }
    };

    return (
        <footer className="bg-[#3EB489] rounded-lg border-t border-white ">
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    {/* Logo and Clinic Name */}
                    <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0 text-white text-center">
                        {clinicDetails.logo ? (
                            <img src={getProfileImage(clinicDetails.logo)} alt="Logo" className="h-32 w-auto mb-2" />
                        ) : (
                            <div className="text-2xl font-bold mb-2">LOGO</div>
                        )}
                        <div className="text-lg font-bold capitalize">{clinicDetails.DentalName}</div>
                    </div>

                    {/* Clinic Contact Information */}
                    <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-start text-white">
                        <div className="font-bold uppercase">Stay in Touch</div>
                        <div className="mt-1 flex items-center">
                            <span className="material-symbols-outlined text-red-500 mr-1">location_on</span>
                            <span className="font-semibold">Address:</span>
                            <span className="ml-2">{clinicDetails.Address}</span>
                        </div>
                        <div className="mt-1 flex items-center">
                            <span className="material-symbols-outlined text-blue-500 mr-1">call</span>
                            <span className="font-semibold">Contact Number:</span>
                            <span className="ml-2">{clinicDetails.ContactNumber}</span>
                        </div>
                        <div className="mt-1 flex items-center">
                            <span className="material-symbols-outlined text-black mr-1">mail</span>
                            <span className="font-semibold">Email:</span>
                            <span className="ml-2">{clinicDetails.Email}</span>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-start text-white">
                        <div className="font-bold uppercase">Social Media</div>
                        {clinicDetails.Facebooklink ? (
                            <a
                                href={clinicDetails.Facebooklink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 hover:underline"
                            >
                                <span className='font-bold'>Facebook:</span> Alejandria Dental Clinic
                            </a>
                        ) : (
                            <div className="mt-1">No Facebook link available</div>
                        )}

                        <div className="mt-4 font-bold uppercase">Clinic Hours</div>
                        <div className="mt-1"><span className='font-semibold'>Weekdays:</span> {clinicDetails.WeekdaysTime}</div>
                        <div className="mt-1"><span className='font-semibold'>Weekends:</span> {clinicDetails.WeekendsTime}</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}


// import React, { useEffect, useState } from 'react';
// import axios from 'axios'; // Import axios

// export default function Footer() {
//     const [clinicDetails, setClinicDetails] = useState(null);
//     const BASEURL = import.meta.env.VITE_BASEURL;
//     const contactApiUrl = `${BASEURL}/Contactus/contactus`;

//     // Fetch clinic details from the API
//     useEffect(() => {
//         const fetchClinicDetails = async () => {
//             try {
//                 const response = await axios.get(contactApiUrl); // Use axios to fetch data
//                 // Assuming the response data is an array, set the first item as clinicDetails
//                 if (response.data.length > 0) {
//                     setClinicDetails(response.data[0]); // Set the first clinic detail
//                 }
//             } catch (error) {
//                 console.error('Error fetching clinic details:', error);
//             }
//         };

//         fetchClinicDetails();
//     }, [contactApiUrl]); // Dependency array

//     if (!clinicDetails) {
//         return <div className="text-center">Loading...</div>; // Loading state
//     }
//     const getProfileImage = (profilePicture) => {

//         // Check if the profile picture is available
//         if (profilePicture) {
//             return `data:image/jpeg;base64,${profilePicture}`; // Adjust to image format (jpeg/png)
//         } else {
//             return "https://via.placeholder.com/150"; // Fallback if no image
//         }
//     };
//     return (
//         <footer className="rounded-lg border bg-[#3EB489] ">
//             <div className='max-w-7xl mx-auto p-5 '>
//                 <div className="flex flex-col sm:flex-row justify-between items-center">
//                     {/* Logo and Clinic Name */}
//                     <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
//                         {clinicDetails.logo ? (
//                             <img src={getProfileImage(clinicDetails.logo)} alt="Logo" className="h-32 w-auto mb-2" />
//                         ) : (
//                             <div className="text-xl font-bold mb-2">LOGO</div>
//                         )}
//                         <div className="text-lg font-bold text-white ml-7 capitalize">{clinicDetails.DentalName}</div>
//                     </div>
    
//                     {/* Clinic Contact Information */}
//                     <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-start">
//                         <div className="font-bold text-white uppercase">Stay in touch</div>
//                         <div className="mt-1 flex items-center">
//                             <span className="material-symbols-outlined text-red-500 mr-1">location_on</span>
//                             <span className="font-semibold">Address:</span>
//                             <span className="ml-2">{clinicDetails.Address}</span>
//                         </div>
//                         <div className="mt-1 flex items-center">
//                             <span className="material-symbols-outlined text-blue-500 mr-1">call</span>
//                             <span className="font-semibold">Contact Number:</span>
//                             <span className="ml-2">{clinicDetails.ContactNumber}</span>
//                         </div>
//                         <div className="mt-1 flex items-center">
//                             <span className="material-symbols-outlined text-black mr-1">mail</span>
//                             <span className="font-semibold">Email:</span>
//                             <span className="ml-2">{clinicDetails.Email}</span>
//                         </div>
//                     </div>


//                     {/* Navigation Links */}
//                     {/* <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-start">
//                         <div className="font-bold">Navigation</div>
//                         <a href="#about" className="mt-1 hover:underline">About</a>
//                         <a href="#services" className="mt-1 hover:underline">Services</a>
//                         <a href="#contact" className="mt-1 hover:underline">Contact</a>
//                     </div> */}
    
//                     {/* Social Media Links */}
//                     <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-start">
//                         <div className="font-bold text-white uppercase">Social Media</div>
//                         {clinicDetails.Facebooklink ? (
//                             <a
//                                 href={clinicDetails.Facebooklink}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="mt-1 hover:underline"
//                             >
//                                 <span className='font-bold'>Facebook:</span> Alejandria Dental Clinic
//                             </a>
//                         ) : (
//                             <div className="mt-1">No Facebook link available</div>
//                         )}

//                     <div className="mt-2 font-bold text-white uppercase">Clinic Hours</div>
//                         <div className="mt-1"><span className='font-bold'>Weekdays: </span>{clinicDetails.WeekdaysTime}</div>
//                         <div className="mt-1"><span className='font-bold'>Weekends: </span>{clinicDetails.WeekendsTime}</div>
//                     </div>
//                 </div>
//             </div>
//         </footer>
//     );
// }
