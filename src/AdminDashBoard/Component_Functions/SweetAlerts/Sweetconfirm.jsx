import React from 'react';
import Swal from 'sweetalert2';

export default function Sweetconfirm({
    title = "Are you sure?", // Default title
    text = "You won't be able to revert this!", // Default text
    confirmButtonText = "Yes, delete it!", // Default confirm button text
    cancelButtonText = "Cancel", // Default cancel button text
    confirmButtonColor = "#3085d6", // Default confirm button color
    cancelButtonColor = "#d33", // Default cancel button color
    onConfirm, // Function to call on confirmation
}) {
    const handleDelete = () => {
        Swal.fire({
            title: title,
            text: text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: confirmButtonColor,
            cancelButtonColor: cancelButtonColor,
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText,
        }).then((result) => {
            if (result.isConfirmed) {
                // Call the onConfirm function if provided
                if (onConfirm) {
                    onConfirm();
                }
                Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success",
                });
            }
        });
    };

    return (
        <div>
            <button onClick={handleDelete}>Delete File</button>
        </div>
    );
}


// <Sweetconfirm
//     title="Confirm Deletion"
//     text="Are you sure you want to delete this file?"
//     confirmButtonText="Yes, delete it!"
//     cancelButtonText="No, keep it"
//     onConfirm={() => {
//         // Custom function to execute on confirmation
//         console.log("File deleted");
//     }}
// />
