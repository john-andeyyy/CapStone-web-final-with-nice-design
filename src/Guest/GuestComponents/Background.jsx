import React from 'react';
import Background from './Background'; // Adjust the path as necessary

const MyComponent = () => {
    return (
        <Background
            className="bg-gray-500"
            imageUrl="./public/dentbg.jpg" 
        >
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-semibold">Welcome to My App</h1>
            </div>
        </Background>
    );
};

export default MyComponent;
