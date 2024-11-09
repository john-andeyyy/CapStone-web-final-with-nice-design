import React, { useState, useEffect } from 'react';
import ThemeController from '../GuestComponents/ThemeController';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GuestNavBar() {

    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [name, setname] = useState([]);
    const [logo, setlogo] = useState();

    const BASEURL = import.meta.env.VITE_BASEURL;


    const getProfileImage = (profilePicture) => {

        // Check if the profile picture is available
        if (profilePicture) {
            return `data:image/jpeg;base64,${profilePicture}`; // Adjust to image format (jpeg/png)
        } else {
            return "https://via.placeholder.com/150"; // Fallback if no image
        }
    };


    useEffect(() => {
        axios.get(`${BASEURL}/Contactus/contactus`)
            .then(response => {
                if (response.data.length > 0) {
                    setname(response.data[0]);
                    setlogo(getProfileImage(response.data[0].logo))
                }
            })
            .catch(error => {
                console.error('There was an error fetching the contact data:', error);
            });
    }, []);



    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="bg-[#3EB489] sticky top-0 z-50">
            <div className="navbar container mx-auto flex items-center justify-between flex-wrap">
                <div className="flex-1">
                    <img src={logo} alt="" className='h-12' />
                    <a className="  text-2xl font-serif text-white font-bold uppercase" onClick={() => navigate('/')}>{name.DentalName}</a>

                </div>

                <div className="block lg:hidden">
                    <button onClick={toggleMenu} className="btn btn-ghost text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}></path>
                        </svg>
                    </button>
                </div>
                <div className={`flex-none ${isMenuOpen ? 'block' : 'hidden'} lg:flex lg:items-center lg:w-auto w-full`}>
                    <ul className="menu menu-horizontal px-1 font-semibold space-x-3 lg:space-x-3 flex flex-col lg:flex-row">
                        <li className="mb-2 md:mb-0">
                            <button className="btn btn-ghost font-bold text-white text-xl" onClick={() => {navigate('/');toggleMenu()}}>HOME</button>
                        </li>
                        <li className="mb-2 md:mb-0">
                            <button className="btn btn-ghost font-bold text-white text-xl" onClick={() => { navigate('/AllServices'); toggleMenu() }}>SERVICES</button>
                        </li>
                        <li className="mb-2 md:mb-0">
                            <button className="btn btn-ghost font-bold text-white text-xl"
                                onClick={() => { navigate('The_DeanTeam'); toggleMenu() }}
                            >DEANTEAM </button>
                        </li>
                        {/*                         
                        <li className="mb-2 md:mb-0">
                            <button className="btn btn-outline btn-success"
                                onClick={() => {
                                    navigate('/CreateAccount')
                                    toggleMenu
                                }}>SIGN UP</button>
                        </li> */}

                        {/* <li className="mb-2 md:mb-0">
                            <button className="btn  bg-[#D9D9D9] hover:bg-[#ADAAAA] text-black" onClick={() => navigate('/AdminLogin')}>LOGIN</button>
                        </li> */}

                        <li className="mb-2 md:mb-0">
                            <button className="btn btn-ghost font-bold text-[#266D53] bg-[#C6E4DA] text-xl"
                                onClick={() => {
                                    navigate('AdminLogin')
                                    toggleMenu()
                                }}
                            >LOGIN </button>
                        </li>

                    </ul>
                </div>
            </div>
        </div>
    );
}
