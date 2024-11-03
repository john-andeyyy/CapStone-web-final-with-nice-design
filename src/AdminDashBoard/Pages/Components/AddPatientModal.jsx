import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const AddPatientModal = ({ isOpen, onClose, onPatientAdded }) => {
    const formik = useFormik({
        initialValues: {
            FirstName: '',
            LastName: '',
            MiddleName: '',
            Email: '',
            PhoneNumber: '',
            Address: '',
            Gender: '',
            Age: '',
            Zipcode: '',
            CivilStatus: '',
        },
        validationSchema: Yup.object({
            FirstName: Yup.string().required('First name is required.'),
            LastName: Yup.string().required('Last name is required.'),
            Email: Yup.string()
                .email('Email is invalid.')
                .required('Email is required.'),
            PhoneNumber: Yup.string()
                .required('Phone number is required.')
                .length(11, 'Phone number must be 11 digits.'),
            Address: Yup.string().required('Address is required.'),
            Age: Yup.number()
                .required('Age is required.')
                .typeError('Age must be a number.'),
            Zipcode: Yup.string().required('Zipcode is required.'),
            CivilStatus: Yup.string().required('Civil status is required.'),
            Gender: Yup.string().required('Gender is required.'),
        }),
        onSubmit: async (values) => {
            const Baseurl = import.meta.env.VITE_BASEURL;

            try {
                const response = await axios.post(`${Baseurl}/Patient/auth/WalkingAccount`, values);
                console.log('Patient added:', response.data);
                onPatientAdded();
                onClose(); // Close the modal after successful submission
            } catch (error) {
                console.error('Error adding patient:', error);
            }
        },
    });

    const handleCancel = () => {
        formik.resetForm(); // Clear the form data
        onClose(); // Close the modal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#C6E4DA] p-6 rounded-lg shadow-lg w-11/12 max-w-4xl">
                <h2 className="text-2xl font-bold mb-6 text-[#266D53] text-center">Add New Patient</h2>
                <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(formik.initialValues).map((key) => (
                        <div key={key} className="flex flex-col">
                            <label className="mb-2 font-medium text-gray-800">{key.replace(/([A-Z])/g, ' $1')}</label>
                            {key === 'Gender' ? (
                                <select
                                    name={key}
                                    value={formik.values[key]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`border ${formik.touched[key] && formik.errors[key] ? 'border-red-500' : 'border-gray-300'} p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition duration-200`}
                                >
                                    <option value="" label="Select gender" />
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            ) : (
                                <input
                                    type={
                                        key === 'Email' ? 'email' :
                                            key === 'PhoneNumber' ? 'tel' :
                                                key === 'Age' ? 'number' :
                                                    'text'
                                    }
                                    name={key}
                                    value={formik.values[key]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`border ${formik.touched[key] && formik.errors[key] ? 'border-red-500' : 'border-gray-300'} p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition duration-200`}
                                    placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
                                />
                            )}
                            {formik.touched[key] && formik.errors[key] && (
                                <span className="text-red-500 text-sm">{formik.errors[key]}</span>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-between mt-8 md:col-span-2 lg:col-span-3">
                        <button
                            type="submit"
                            className="bg-[#4285F4] hover:bg-[#0C65F8] text-black p-4 rounded-md transition duration-200"
                        >
                            Add Patient
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel} // Call handleCancel on click
                            className="bg-[#D9D9D9] hover:bg-[#ADAAAA] text-gray-800 p-4 rounded-md transition duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientModal;
