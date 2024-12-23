// SemiFullModal.js
import React from 'react';

const SemiFullModal = ({ isOpen, onClose, children }) => {
    return (
        <dialog open={isOpen} className="modal  bg-gray-900 bg-opacity-75">
            <div className="modal-box w-[70%] max-h-[90%] max-w-full flex flex-col bg-[#ffffff]  relative p-5">
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
    );
};

export default SemiFullModal;
