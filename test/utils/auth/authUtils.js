// authUtils.js
import axios from 'axios';
// import { showToast } from '../../../AdminDashBoard/Components/ToastNotification';

export const handleRequestPasswordReset = async (email, BASEURL) => {
    try {
        const response = await axios.post(`${BASEURL}/Admin/auth/requestPasswordReset`, { Email: email });
        // showToast('success', 'Password reset link sent to your email!');
        return response.data.message || 'Password reset link sent to your email!';
    } catch (error) {
        throw new Error(error.response.data);
    }
};

export const handleVerifyOtp = async (email, otp, BASEURL) => {
    try {
        const response = await axios.post(`${BASEURL}/Admin/auth/verifyPasswordResetOTP`, { Email: email, otp });
        // showToast('success', 'OTP verified successfully!');
        return response.data.message || 'OTP verified successfully!';
    } catch (error) {
        throw new Error('Invalid OTP. Please try again.');
    }
};

export const handleResetPassword = async (email, newPassword, BASEURL, navigate) => {
    try {
        const response = await axios.post(`${BASEURL}/Admin/auth/resetPassword`, { Email: email, newPassword });
        // showToast('success', 'Password reset successfully!');
        navigate('/AdminLogin');
        return response.data.message || 'Password reset successfully!';
    } catch (error) {
        throw new Error('Error resetting password. Please try again.');
    }
};
