import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DashboardTips() {
    const navigate = useNavigate();
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const BASEURL = import.meta.env.VITE_BASEURL;
    const getRandomTips = (data, numberOfTips) => {
        // Shuffle the array
        const shuffled = data.sort(() => 0.5 - Math.random());
        // Select the first 'numberOfTips' elements
        return shuffled.slice(0, numberOfTips);
    };
    useEffect(() => {
        const fetchTips = async () => {
            try {
                const response = await axios.get(`${BASEURL}/Tips/gettips`);
                if (response.data.length >= 9) {
                    setTips(getRandomTips(response.data, 9));
                } else {
                    setTips(response.data); 
                }
            } catch (error) {
                console.error("Error fetching tips:", error);
                setError("Failed to load tips. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchTips();
    }, []);

    const getProfileImage = (profilePicture) => {
        if (profilePicture instanceof File) {
            return URL.createObjectURL(profilePicture);
        }
        return profilePicture
            ? `data:image/jpeg;base64,${profilePicture}`
            : "https://via.placeholder.com/150";
    };

    if (loading) {
        return <div className="text-center p-4">Loading tips...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className=" flex-1 rounded-md ml-10 mr-10"
            style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
            <div className="bg-white rounded-md p-5">
                <h2 className="text-5xl font-bold  text-[#266D53] ">
                    Tips from Al Dente
                </h2>

                <div className="grid grid-cols-1 ml-10 mr-10 mt-10 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tips.map((tip) => (
                        <div
                            key={tip._id}
                            className="border border-primary mb-5 bg-accent rounded-lg p-4 shadow-md hover:shadow-lg transition overflow-hidden"
                        >
                            <div className="flex justify-center mb-4">
                                <img
                                    src={getProfileImage(tip.image)}
                                    alt={tip.Title}
                                    className="w-24 h-24 object-cover rounded-full shadow-md"
                                />
                            </div>

                            <h3 className="text-lg font-semibold mb-2">{tip.Title}</h3>
                            <p className="text-gray-600">{tip.Description}</p>
                        </div>
                    ))}
                </div>
        </div>
    </div>
    );
}
