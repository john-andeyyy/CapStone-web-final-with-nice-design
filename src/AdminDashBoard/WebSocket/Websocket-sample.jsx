import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const baseurl = 'http://localhost:3000';
const socket = io(baseurl); // 1st add

const AnnouncementComponent = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        // Function to fetch all announcements
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch(`${baseurl}/Announcement/allannouncements`, {
                    method: 'GET',
                    credentials: 'include' // Include credentials with the request
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setAnnouncements(data.reverse()); // Set the state with fetched announcements
            } catch (error) {
                console.error('Error fetching announcements:', error);
            }
        };

        fetchAnnouncements(); // Fetch announcements when the component mounts

        // Listen for new announcements from the server
        socket.on('new-announcement', (newAnnouncement) => { // 2nd add
            // announcement to the existing list
            // setAnnouncements(prevAnnouncements => [...prevAnnouncements, newAnnouncement]); // for the bottom
            setAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]); // for the top

        });

        return () => {
            socket.off('new-announcement') // 3rd add
        };
    }, []); 
    return (
        <div>
            <h1>Announcements</h1>
            <ul>
                {announcements.map(announcement => (
                    <li key={announcement._id}>
                        <h2>{announcement.Title}</h2>
                        <p>{announcement.Message}</p>
                        <small>{announcement.createdAt}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AnnouncementComponent;
