// authUtils.test.js
import axios from 'axios';
import { handleRequestPasswordReset, handleVerifyOtp, handleResetPassword } from '../utils/auth/authUtils';
jest.mock('axios');

describe('Auth Utility Functions', () => {
    const BASEURL = 'http://localhost:3000'; // Replace with actual base URL
    const navigate = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should handle request password reset and return success message', async () => {
        axios.post.mockResolvedValue({ data: { message: 'Password reset link sent to your email!' } });

        const email = 'test@example.com';
        const message = await handleRequestPasswordReset(email, BASEURL);

        expect(message).toBe('Password reset link sent to your email!');
        expect(axios.post).toHaveBeenCalledWith(`${BASEURL}/Admin/auth/requestPasswordReset`, { Email: email });
    });

    test('should throw error for failed request password reset', async () => {
        axios.post.mockRejectedValue({ response: { data: 'Error sending password reset link.' } });

        const email = 'test@example.com';

        await expect(handleRequestPasswordReset(email, BASEURL)).rejects.toThrow('Error sending password reset link.');
        expect(axios.post).toHaveBeenCalledWith(`${BASEURL}/Admin/auth/requestPasswordReset`, { Email: email });
    });

    test('should handle OTP verification and return success message', async () => {
        axios.post.mockResolvedValue({ data: { message: 'OTP verified successfully!' } });

        const email = 'test@example.com';
        const otp = '123456';
        const message = await handleVerifyOtp(email, otp, BASEURL);

        expect(message).toBe('OTP verified successfully!');
        expect(axios.post).toHaveBeenCalledWith(`${BASEURL}/Admin/auth/verifyPasswordResetOTP`, { Email: email, otp });
    });

    test('should throw error for invalid OTP verification', async () => {
        axios.post.mockRejectedValue({ response: { data: 'Invalid OTP' } });

        const email = 'test@example.com';
        const otp = 'wrong-otp';

        await expect(handleVerifyOtp(email, otp, BASEURL)).rejects.toThrow('Invalid OTP. Please try again.');
        expect(axios.post).toHaveBeenCalledWith(`${BASEURL}/Admin/auth/verifyPasswordResetOTP`, { Email: email, otp });
    });

    test('should handle password reset and return success message', async () => {
        axios.post.mockResolvedValue({ data: { message: 'Password reset successfully!' } });

        const email = 'test@example.com';
        const newPassword = 'newPassword123';
        const message = await handleResetPassword(email, newPassword, BASEURL, navigate);

        expect(message).toBe('Password reset successfully!');
        expect(axios.post).toHaveBeenCalledWith(`${BASEURL}/Admin/auth/resetPassword`, { Email: email, newPassword });
        expect(navigate).toHaveBeenCalledWith('/AdminLogin');
    });

    test('should throw error for failed password reset', async () => {
        axios.post.mockRejectedValue({ response: { data: 'Error resetting password' } });

        const email = 'test@example.com';
        const newPassword = 'newPassword123';

        await expect(handleResetPassword(email, newPassword, BASEURL, navigate)).rejects.toThrow('Error resetting password. Please try again.');
        expect(axios.post).toHaveBeenCalledWith(`${BASEURL}/Admin/auth/resetPassword`, { Email: email, newPassword });
    });
});
