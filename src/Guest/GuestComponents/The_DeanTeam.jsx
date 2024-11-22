import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function TheDeanTeam() {
    const [members, setMembers] = useState([]);
    const BASEURL = import.meta.env.VITE_BASEURL;

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`${BASEURL}/members/group-members`);
                setMembers(response.data); // Ensure this is an array
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };

        fetchMembers();
    }, []);

    const getProfileImage = (profilePicture) => {

        // Check if the profile picture is available
        if (profilePicture) {
            return `data:image/jpeg;base64,${profilePicture}`; // Adjust to image format (jpeg/png)
        } else {
            return "https://via.placeholder.com/150"; // Fallback if no image
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* <div className="absolute inset-0 bg-[url('/sana.png')] bg-cover bg-center opacity-50 -z-10"></div> */}
            {/* <h1 className="text-3xl font-bold mb-4 text-green-500 p-2">DenTeam:</h1> */}
            <div className='p-8'>
                <div id="title" className="flex justify-center pb-7">
                    <div
                    // className="rounded-md shadow-md mx-10"
                    // style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}
                    >
                        <h1 className="text-5xl font-bold uppercase p-2 text-center">
                            THE <span className="text-[#025373]">DENTEAM</span>
                        </h1>
                    </div>
                </div>


                <div className=" p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {members.length > 0 ? (
                        members.map(member => (
                            <div key={member._id} className="card card-compact bg-[#96D2D9] border border-[#012840] shadow-xl">
                                <figure>
                                    <img
                                        src={getProfileImage(member.ProfilePicture)} // Handle base64 image
                                        alt={`${member.FirstName} ${member.LastName}`}
                                        className="object-cover h-48 pt-5 " // Ensures the image covers the card
                                    />
                                </figure>
                                <div className="card-body">
                                    <div className='flex justify-center items-center'>
                                        <h1 className="card-title text-[#025373] text-center">{`${member.FirstName} ${member.LastName}`}</h1>
                                    </div>
                                    <div className="flex items-center">
                                        <h4 className='font-bold mr-2'>Role:</h4>
                                        <span>{member.Role}</span>
                                    </div>

                                    <div className="flex items-center">
                                        <h4 className='font-bold mr-2'>Contact Number:</h4>
                                        <span>{member.ContactNumber}</span>
                                    </div>

                                    <div className=''>
                                        <a href={member.Facebooklink} target="_blank" rel="noopener noreferrer" className="text-[#025373]">
                                            Facebook Profile
                                        </a>
                                        <p>Email: <span>{member.Email}</span></p>
                                        {/* <a href={member.Email} target="_blank" rel="noopener noreferrer" className="text-[#025373]">
                                            Email
                                        </a> */}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-center">No members found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
