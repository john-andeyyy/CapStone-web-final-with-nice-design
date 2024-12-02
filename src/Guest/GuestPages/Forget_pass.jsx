import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '../../AdminDashBoard/Components/ToastNotification';

export default function Forget_pass() {
    const BASEURL = import.meta.env.VITE_BASEURL; // Replace with your actual base URL
    const [step, setStep] = useState(1); // 1: Request, 2: Verify OTP, 3: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Request Password Reset
    const handleRequestPasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${BASEURL}/Admin/auth/requestPasswordReset`, { Email: email });
            showToast('success', 'Password reset link sent to your email!');

            setMessage(response.data.message || 'Password reset link sent to your email!');
            setStep(2);
        } catch (error) {
            setMessage(error.response.data);
            // console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${BASEURL}/Admin/auth/verifyPasswordResetOTP`, { Email: email, otp });
            showToast('success', 'OTP verified successfully!');

            setMessage(response.data.message || 'OTP verified successfully!');
            setStep(3);
        } catch (error) {
            setMessage('Invalid OTP. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${BASEURL}/Admin/auth/resetPassword`, { Email: email, newPassword });
            showToast('success', 'Password reset successfully!');

            setMessage(response.data.message || 'Password reset successfully!');
            navigate('/AdminLogin');
            setEmail('');
            setOtp('');
            setNewPassword('');
        } catch (error) {
            setMessage('Error resetting password. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* <div className="absolute inset-0 bg-[url('/sana.png')] bg-cover bg-center opacity-50 -z-10"></div> */}
            <div className="flex-1 rounded-md"
                style={{ boxShadow: '0 4px 8px rgba(0,0,0, 0.5)' }}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-[#96D2D9] rounded-lg shadow-lg p-8 w-96">
                        <h2 className="text-2xl font-bold text-[#025373] text-center mb-4">Reset Password</h2>
                        {message && <p className="text-center text-red-500 mb-4">{message}</p>}

                        {step === 1 && (
                            <form onSubmit={handleRequestPasswordReset}>
                                <label className="block text-[#012840] mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ textTransform: "none" }}
                                    className="bg-gray-100 text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your email"
                                    required
                                />
                                <button
                                    type="submit"
                                    className={`w-full mt-4 py-2 rounded-md text-white ${loading ? 'bg-[#ADAAAA]' : 'bg-[#025373] hover:bg-[#03738C]'}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Request Password Reset'}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp}>
                                <label className="block text-[#025373] mb-2">Enter OTP</label>
                                <input
                                    type="number"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="bg-gray-100 text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter OTP sent to your email"
                                    required
                                />
                                <button
                                    type="submit"
                                    className={`w-full mt-4 py-2 rounded-md text-white ${loading ? 'bg-[#ADAAAA]' : 'bg-[#025373] hover:bg-[#03738C]'}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleResetPassword}>
                                <label className="block text-[#025373] mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-gray-100 text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your new password"
                                    required
                                />
                                <button
                                    type="submit"
                                    className={`w-full mt-4 py-2 rounded-md text-white ${loading ? 'bg-[#ADAAAA]' : 'bg-[#025373] hover:bg-[#03738C]'}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}

                        <div className="mt-4 text-center">
                            <Link to={`/AdminLogin`} className="text-[#025373] hover:text-[#03738C] transition duration-150">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
