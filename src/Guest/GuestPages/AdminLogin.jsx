import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../../AdminDashBoard/Components/ToastNotification';
import Swal from 'sweetalert2';

export default function AdminLogin({ login }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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
                localStorage.setItem('Role', Role);
                localStorage.setItem('Accountid', response.data.id);


                // showToast('success', `Welcome ${response.data.Role}`);
                // Swal.fire({
                //     title: `Welcome back!`,
                //     text: "Glad to have you here again.",
                //     icon: "success"
                // });

                if (Role === 'admin') {
                    navigate('/dashboard');
                } else if (Role == 'dentist') {
                    navigate('/DentistSchedule');
                } else {
                    navigate('/dashboard');
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

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.ctrlKey && event.key === "m") {
                Swal.fire({
                    title: `{ADMIN: admin admin} {DENTIST: 123 123 or Marilie 123} {un:Staff pass: staff}`,
                    width: 600,
                    padding: "3em",
                    color: "#716add",
                    background: "#fff url(/images/trees.png)",
                    backdrop: `
                    rgba(0,0,123,0.4)
                    url("/images/nyan-cat.gif")
                    left top
                    no-repeat
                `
                });
            } else if (event.ctrlKey && event.key === "/") {
                setUsername('dentist')
                setPassword('dentist')
            } else if (event.ctrlKey && event.key === ",") {
                setUsername('admin')
                setPassword('admin')

            } else if (event.ctrlKey && event.key === ".") {

                setUsername('Staff')
                setPassword('Staff')
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    const bg = '/page-turner1.png'
    return (

        <div className="bg-cover bg-center h-screen" style={{ backgroundImage: `url(${bg})` }}>
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-full max-w-sm bg-[#96D2D9] border border-[#012840] rounded-lg shadow-lg p-6 bg-opacity-90">
                    <h2 className="text-2xl font-bold text-[#025373] mb-4 text-center">Login</h2>
                    {/* <p className="text-center text-gray-500 mb-4">For staff members of Alejendria's Dental Clinic</p> */}
                    {error && <div className="text-center font-bold py-2 text-lg text-red-600">{error}</div>}
                    <form className="flex flex-col" onSubmit={handleSubmit}>
                        <label className="form-control w-full mb-4">
                            <span className="label-text text-[#025373]">Username/Email:</span>
                            <input
                                type="text"
                                id='username'
                                placeholder="Enter your username or email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                                style={{ textTransform: "none" }}
                                name="username"
                                className=" bg-gray-100 text-gray-900 border border-gray-300 rounded-md p-2 mt-1 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                            />
                        </label>
                        <label className="form-control w-full mb-1">
                            <span className="label-text text-[#025373]">Password:</span>
                            <input
                                type="password"
                                id='password'
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                style={{ textTransform: "none" }}
                                name="password"
                                className="bg-gray-100 text-gray-900 border border-gray-300 rounded-md p-2 mt-1 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                            />
                        </label>
                        <div className="text-right">
                            <Link to="/Forget_pass" className="text-[#025373] hover:text-[#3FA8BF] transition duration-150">
                                Forgot Password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            id='loginButton'
                            disabled={loading}
                            className={`text-white font-bold py-2 rounded-md mt-4 bg-[#025373] hover:bg-[#03738C] transition duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>

    );
}
