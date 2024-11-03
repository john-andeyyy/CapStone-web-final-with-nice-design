// SemiFullModal.js
import React from 'react';

const Modal90 = ({ isOpen, onClose, children }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <dialog open={isOpen} className="modal ">
                <div className="modal-box w-[90%] h-[90%] max-w-full flex flex-col  relative p-5 ">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                        onClick={onClose}
                    >
                        ✕
                    </button>
    
                    {/* Modal content */}
                    {children}
                </div>
            </dialog>
       </div>
    );
};

export default Modal90;
