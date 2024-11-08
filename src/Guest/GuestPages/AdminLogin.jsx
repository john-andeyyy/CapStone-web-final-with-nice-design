import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../../AdminDashBoard/Components/ToastNotification';
import Swal from 'sweetalert2';

export default function AdminLogin({ login }) {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const database = import.meta.env.VITE_BASEURL;
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${database}/Admin/auth/login`,
                { Username: username, Password: password },
                { withCredentials: true });

            if (response.status === 200) {
                const tempRole = response.data.Role
                const Role = tempRole.toLowerCase()

                localStorage.setItem("Islogin", true);
                localStorage.setItem("Token", response.data.token);
                localStorage.setItem("expiresin", response.data.expiresIn);
                localStorage.setItem('lastActiveTime', new Date().getTime());
                localStorage.setItem('Role', Role );
                localStorage.setItem('Accountid', response.data.id);


                // showToast('success', `Welcome ${response.data.Role}`);
                Swal.fire({
                    title: `Welcome back, ${response.data.Role}!`,
                    text: "Glad to have you here again.",
                    icon: "success"
                });

                if (Role === 'admin'){
                    navigate('/dashboard');
                } else if (Role== 'dentist'){
                    navigate('/DentistSchedule');
                }


                login();
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/sana.png')" }}>
            <div className="absolute inset-0 bg-black opacity-50 -z-10"></div>
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-[#266D53] mb-4 text-center">Admin Login</h2>
                    <p className="text-center text-gray-500 mb-4">For staff members of Alejendria's Dental Clinic</p>
                    {error && <div className="text-center font-bold py-2 text-lg text-red-600">{error}</div>}
                    <form className="flex flex-col" onSubmit={handleSubmit}>
                        <label className="form-control w-full mb-4">
                            <span className="label-text text-green-600">Username/Email:</span>
                            <input
                                type="text"
                                placeholder="Enter your username or email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-gray-100 text-gray-900 border border-gray-300 rounded-md p-2 mt-1 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
                            />
                        </label>
                        <label className="form-control w-full mb-1">
                            <span className="label-text text-green-600">Password:</span>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-gray-100 text-gray-900 border border-gray-300 rounded-md p-2 mt-1 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
                            />
                        </label>
                        <div className="text-right">
                            <Link to="/Forget_pass" className="text-green-600 hover:text-green-700 transition duration-150">
                                Forgot Password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`text-white font-bold py-2 rounded-md mt-4 bg-[#3EB489] hover:bg-[#62A78E] transition duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
