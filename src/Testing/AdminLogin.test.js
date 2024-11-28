import AdminLogin from '.././Guest/GuestPages/AdminLogin';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create a mock for Axios
const mock = new MockAdapter(axios);
const database = import.meta.env.VITE_BASEURL;

describe('AdminLogin Component', () => {
    afterEach(() => {
        mock.reset(); // Reset mock after each test
    });

    it('should render the login form', () => {
        render(<AdminLogin />);

        expect(document.querySelector('input[placeholder="Enter your username or email"]')).toBeInTheDocument();
        expect(document.querySelector('input[placeholder="Enter your password"]')).toBeInTheDocument();
        expect(document.querySelector('button')).toHaveTextContent('Login');
    });

    it('should call the login API and handle success', async () => {
        mock.onPost(`${database}/Admin/auth/login`).reply(200, {
            Role: 'admin',
            token: 'mock-token',
            expiresIn: 'mock-expiry',
            id: 'mock-id',
        });

        const { getByPlaceholderText, getByRole } = render(<AdminLogin login={() => { }} />);

        const usernameInput = getByPlaceholderText(/Enter your username or email/i);
        const passwordInput = getByPlaceholderText(/Enter your password/i);

        // Simulate user input
        fireEvent.change(usernameInput, { target: { value: 'testUser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Simulate form submission
        fireEvent.click(getByRole('button', { name: /login/i }));

        // Wait for any potential side-effects after API call
        await waitFor(() => expect(localStorage.getItem("Islogin")).toBe('true'));
    });

    it('should show an error if the login fails', async () => {
        mock.onPost('/your-api-url/Admin/auth/login').reply(400, {
            message: 'Invalid username or password.',
        });

        const { getByPlaceholderText, getByRole, findByText } = render(<AdminLogin login={() => { }} />);

        const usernameInput = getByPlaceholderText(/Enter your username or email/i);
        const passwordInput = getByPlaceholderText(/Enter your password/i);

        // Simulate user input
        fireEvent.change(usernameInput, { target: { value: 'testUser' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongPassword' } });

        // Simulate form submission
        fireEvent.click(getByRole('button', { name: /login/i }));

        // Wait for the error message to appear
        const errorMessage = await findByText('Invalid username or password.');
        expect(errorMessage).toBeInTheDocument();
    });
});
