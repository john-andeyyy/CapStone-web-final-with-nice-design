import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function SweetwithIcon({ title, text, icon, confirmButtonText, onClose }) {
  useEffect(() => {
    const showAlert = () => {
      Swal.fire({
        title: title || 'Notification',
        text: text || 'This is a message.',
        icon: icon || 'info', // Default icon can be 'info', 'success', 'warning', 'error', or 'question'
        confirmButtonText: confirmButtonText || 'Okay',
      }).then((result) => {
        if (onClose) {
          onClose(result.isConfirmed); // Call onClose with the result
        }
      });
    };

    showAlert();
  }, [title, text, icon, confirmButtonText, onClose]);

  return null; // No need to render anything
}


// setAlertProps({
//   title: "Warning!",
//   text: "This action may have consequences.",
//   icon: "warning",
//   confirmButtonText: "Proceed",
// });