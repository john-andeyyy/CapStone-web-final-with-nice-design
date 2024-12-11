// npm test sidebarbtn.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

// Mock Component
const ListItem = ({ activeItem, handleNavigate }) => (
    <li
        className={`flex items-center p-2 rounded cursor-pointer ${activeItem === 'medical-requests' ? 'bg-[#0071b1] text-white' : 'hover:bg-[#0071b1]'
            }`}
        onClick={() => handleNavigate('/Medical_requests', 'medical-requests')}
    >
        <FaFileAlt className="mr-3" />
        <span>Dental Certificate Requests</span>
    </li>
);

describe('ListItem Component', () => {
    test('renders icon and text correctly', () => {
        const { container } = render(<ListItem activeItem="" handleNavigate={jest.fn()} />);

        expect(container.querySelector('svg')).toBeInTheDocument();

        // Check if text is rendered
        expect(screen.getByText('Dental Certificate Requests')).toBeInTheDocument();
    });


    test('applies active styles when activeItem matches', () => {
        render(<ListItem activeItem="medical-requests" handleNavigate={jest.fn()} />);

        const listItem = screen.getByText('Dental Certificate Requests').closest('li');
        expect(listItem).toHaveClass('bg-[#0071b1]');
        expect(listItem).toHaveClass('text-white');
    });

    test('does not apply active styles when activeItem does not match', () => {
        render(<ListItem activeItem="other-item" handleNavigate={jest.fn()} />);

        const listItem = screen.getByText('Dental Certificate Requests').closest('li');
        expect(listItem).not.toHaveClass('bg-[#0071b1]');
        expect(listItem).not.toHaveClass('text-white');
        expect(listItem).toHaveClass('hover:bg-[#0071b1]');
    });

    test('triggers handleNavigate function on click', () => {
        const mockHandleNavigate = jest.fn();
        render(<ListItem activeItem="" handleNavigate={mockHandleNavigate} />);

        const listItem = screen.getByText('Dental Certificate Requests').closest('li');
        fireEvent.click(listItem);

        expect(mockHandleNavigate).toHaveBeenCalledWith('/Medical_requests', 'medical-requests');
    });
});
