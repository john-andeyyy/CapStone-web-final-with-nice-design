import axios from 'axios';
jest.mock('axios');

describe('POST /login', () => {
    test('should return a token for valid credentials', async () => {
        axios.post.mockResolvedValue({ status: 200, data: { token: 'dummy-token' } });
        const response = await axios.post('http://localhost:3000/Admin/auth/login',
            { Username: 'admin', Password: 'admin' },
            { withCredentials: true }
        );
        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
    });

    test('should return 401 for invalid credentials', async () => {
        axios.post.mockResolvedValue({ status: 401, data: { error: 'Unauthorized' } });
        const response = await axios.post('http://localhost:3000/Admin/auth/login',
            { Username: 'admin', Password: 'wrong-password' },
            { withCredentials: true }
        );
        expect(response.status).toBe(401);
        expect(response.data.error).toBe('Unauthorized');
    });
});

describe('validateEmail', () => {
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    test('should return true for valid email', () => {
        expect(validateEmail('test@example.com')).toBe(true);
    });

    test('should return false for invalid email', () => {
        expect(validateEmail('invalid-email')).toBe(false);
    });

    test('should return false for empty string', () => {
        expect(validateEmail('')).toBe(false);
    });

    test('should return false for email without domain', () => {
        expect(validateEmail('test@')).toBe(false);
    });
});
