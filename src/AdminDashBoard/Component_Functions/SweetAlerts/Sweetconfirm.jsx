import React from 'react';
import Swal from 'sweetalert2';

export default function Sweetconfirm({
    title = "Are you sure?", // Default title
    text = "You won't be able to revert this!", // Default text
    confirmButtonText = "Yes, confirm it!", // Default confirm button text
    cancelButtonText = "Cancel", // Default cancel button text
    confirmButtonColor = "#3085d6", // Default confirm button color
    cancelButtonColor = "#d33", // Default cancel button color
    icon = "warning", // Default icon type
    onConfirm, // Function to call on confirmation
}) {
    const handleConfirm = () => {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            showCancelButton: true,
            confirmButtonColor: confirmButtonColor,
            cancelButtonColor: cancelButtonColor,
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText,
        }).then((result) => {
            if (result.isConfirmed) {
                // Call the onConfirm function if provided
                if (onConfirm) onConfirm();
                Swal.fire({
                    title: "Confirmed!",
                    text: "Your action was successful.",
                    icon: "success",
                });
            }
        });
    };

    return (
        <button onClick={handleConfirm} className="text-white py-2 px-4 hover:text-red-500">
            <span className="material-symbols-outlined text-2xl mr-2">
                warning
            </span>
            Confirm Action
        </button>
    );
}
