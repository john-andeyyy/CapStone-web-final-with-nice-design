import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import InfoSection from '../GuestComponents/InfoSection';
import OurService from '../GuestComponents/OurService';
import { useNavigate } from 'react-router-dom';
import Tips from '../../AdminDashBoard/Components/Dashboard components/Tips';

const BASEURL = import.meta.env.VITE_BASEURL;
const localApiUrl = `${BASEURL}/Landingpage/landing-pages`;
const proceduresApiUrl = `${BASEURL}/Procedure/showwithimage`;

export default function LandingPage() {
    const navigate = useNavigate();
    const [heroData, setHeroData] = useState([]);
    const [procedures, setProcedures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const historyRef = useRef(null); // Ref to the target section

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [heroResponse, proceduresResponse] = await Promise.all([
                    axios.get(localApiUrl),
                    axios.get(proceduresApiUrl),
                ]);
                setHeroData(heroResponse.data);
                setProcedures(proceduresResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const chunkArray = (array, chunkSize) => {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    };

    const procedureColumns = chunkArray(procedures, Math.ceil(procedures.length / 2));

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const heroLandingPage = heroData.find(page => page.isHero);
    const otherLandingPages = heroData.filter(page => !page.isHero);

    const scrollToHistory = () => {
        // Smooth scroll to the services section
        if (historyRef.current) {
            historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="relative pt-8">
            <div className="absolute inset-0 bg-[url('/sana.png')] bg-cover bg-center opacity-50"></div>
            <div className="relative min-h-screen">

                {/* 1st Hero Section */}
                <section className="hero min-h-screen">
                    <div className="text-right flex-1 rounded-md"
                        style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
                        <div className="hero-content flex-col p-10 rounded-xl bg-white lg:flex-row-reverse items-center justify-between w-full">

                            <div className="text-right flex-1">
                                <h1 className="text-6xl font-bold mt-5">Welcome to Alejandria's</h1>
                                <h1 className="text-6xl font-bold pt-2">
                                    Dental <span className="text-[#266D53]">Clinic</span>
                                </h1>
                                <p className="py-6 text-xl text-justify ml-10">
                                    We offer a wide range of dental services tailored to meet your needs—from routine check-ups 
                                    and cleanings to restorative treatments. Our dedicated team of professionals is committed to 
                                    providing personalized care in a comfortable and friendly environment, ensuring your smile stays 
                                    healthy and radiant. Experience exceptional care with us and let your best smile shine!
                                </p>
                                <button
                                    className="bg-[#3EB489] hover:bg-[#62A78E] btn mt-5"
                                    onClick={scrollToHistory} // Updated to use scrollToHistory
                                >
                                    LEARN MORE
                                </button>
                            </div>

                            <div className="flex-1 max-w-md">
                                {otherLandingPages[0]?.Image ? (
                                    <img
                                        src={`data:image/jpeg;base64,${otherLandingPages[0].Image}`}
                                        className="max-w-2xl rounded-lg shadow-2xl w-full h-auto"
                                        alt={otherLandingPages[0].Title}
                                    />
                                ) : (
                                    <div className="max-w-md rounded-lg shadow-2xl bg-gray-200 mx-auto lg:mx-0" />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <Tips />

                {/* 2nd Hero Section */}
                <div ref={historyRef} className=""> 
                    <section className="hero min-h-screen w-full">
                    <div className="text-right flex-1 rounded-md"
                        style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
                        <div className="hero-content rounded-md p-10 bg-white flex-col lg:flex-row-reverse items-center justify-between w-full">
                            <div className="flex-1 max-w-md">
                                {heroLandingPage?.Image ? (
                                    <img
                                        src={`data:image/jpeg;base64,${heroLandingPage.Image}`}
                                        className="max-w-2xl rounded-lg shadow-2xl w-full h-auto"
                                        alt={heroLandingPage.Title}
                                    />
                                ) : (
                                    <div className="max-w-md rounded-lg shadow-2xl bg-gray-200 mx-auto lg:mx-0" />
                                )}
                            </div>
                            <div className="text-center lg:text-left flex-1">
                                <h1 className="text-7xl font-bold font-serif mb-5 uppercase text-[#266D53]">
                                    {heroLandingPage?.Title || "Alejandria's Dental"}
                                </h1>
                                <p className="py-6 text-xl ml-5 mr-5 text-justify">
                                    {heroLandingPage?.description || ''}
                                </p>
                            </div>
                        </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
