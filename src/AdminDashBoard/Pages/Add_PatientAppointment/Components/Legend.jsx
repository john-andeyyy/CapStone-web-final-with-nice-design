import React from 'react';

const Legend = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Markings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center bg-yellow-50 p-2 rounded-md hover:bg-yellow-100 transition duration-200">
                <span className="w-4 h-4 bg-yellow-400 rounded-full inline-block mr-2"></span>
                <p className="text-gray-700">Pending</p>
            </div>
            <div className="flex items-center bg-blue-50 p-2 rounded-md hover:bg-blue-100 transition duration-200">
                <span className="w-4 h-4 bg-blue-400 rounded-full inline-block mr-2"></span>
                <p className="text-gray-700">Approved</p>
            </div>
            <div className="flex items-center bg-green-50 p-2 rounded-md hover:bg-green-100 transition duration-200">
                <span className="w-4 h-4 bg-green-400 rounded-full inline-block mr-2"></span>
                <p className="text-gray-700">Completed</p>
            </div>
            <div className="flex items-center bg-red-50 p-2 rounded-md hover:bg-red-100 transition duration-200">
                <span className="w-4 h-4 bg-red-400 rounded-full inline-block mr-2"></span>
                <p className="text-gray-700">Closed</p>
            </div>
            {/* Uncomment this section if you want to include Cancelled/Rejected */}
            {/* <div className="flex items-center bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition duration-200">
                <span className="w-4 h-4 bg-gray-400 rounded-full inline-block mr-2"></span>
                <p className="text-gray-700">Cancelled/Rejected</p>
            </div> */}
        </div>
    </div>
);

export default Legend;
