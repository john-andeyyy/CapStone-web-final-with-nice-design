import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddPatientModal = ({ isOpen, onClose, onPatientAdded }) => {
    const [isAgreed, setIsAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formik = useFormik({
        initialValues: {
            LastName: '',
            FirstName: '',
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
                .matches(/^\d{11}$/, 'Phone number must be exactly 11 digits.'),
            Address: Yup.string().required('Address is required.'),
            Age: Yup.number()
                .required('Birthday is required.')
                .typeError('Birthday must be a number.'),
            Zipcode: Yup.string().required('Zipcode is required.'),
            // CivilStatus: Yup.string()
            //     .required('Civil status is required.')
            //     .oneOf(['Single', 'Married', 'Divorced', 'Widowed'], 'Invalid Civil Status value.'),
            Gender: Yup.string().required('Gender is required.'),
        }),
        onSubmit: async (values) => {
            const Baseurl = import.meta.env.VITE_BASEURL;

            if (!isAgreed) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Agreement Required',
                    text: 'Please agree to the terms before adding the patient.',
                });
                return;
            }

            setIsLoading(true);

            try {
                const response = await axios.post(`${Baseurl}/Patient/auth/WalkingAccount`, values);
                console.log('Patient added:', response.data);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Patient has been added successfully.',
                });
                onPatientAdded();
                onClose();
            } catch (error) {
                console.error('Error adding patient:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'There was an error adding the patient. Please try again.',
                });
            } finally {
                setIsLoading(false);
                setIsAgreed(false)
                handleCancel()

            }
        },
    });

    const handleCancel = () => {
        formik.resetForm();
        onClose();
        setIsAgreed(false)

    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl">
                <h2 className="text-2xl font-bold mb-6 text-black text-center">Add New Patient</h2>
                <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Fields in a 3-column layout */}
                    <div className="grid grid-cols-3 gap-4 lg:col-span-4">
                        {['LastName', 'FirstName', 'MiddleName', 'Email', 'PhoneNumber', 'Address'].map((key) => (
                            <div key={key} className="flex flex-col">
                                <label className="mb-2 font-medium text-gray-800">
                                    {key.replace(/([A-Z])/g, ' $1')}
                                    {key !== 'MiddleName' && <span className="text-red-500"> *</span>}
                                </label>
                                {key === 'PhoneNumber' ? (
                                    <input
                                        type="text"
                                        name={key}
                                        value={formik.values[key]}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value) && value.length <= 11) {
                                                formik.setFieldValue(key, value);
                                            }
                                        }}
                                        onBlur={formik.handleBlur}
                                        className={`border ${formik.touched[key] && formik.errors[key] ? 'border-red-500' : 'border-gray-300'} p-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition duration-200`}
                                        placeholder={`Enter${key.replace(/([A-Z])/g, ' $1')}`}
                                    />
                                ) : (
                                    <input
                                        type={key === 'Email' ? 'email' : key === 'Age' ? 'number' : 'text'}
                                        name={key}
                                        value={formik.values[key]}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`border capitalize  ${formik.touched[key] && formik.errors[key] ? 'border-red-500' : 'border-gray-300'} p-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition duration-200`}
                                        placeholder={`Enter${key.replace(/([A-Z])/g, ' $1')}`}
                                    />
                                )}
                                {formik.touched[key] && formik.errors[key] && (
                                    <span className="text-red-500 text-sm">{formik.errors[key]}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Separate grid for Gender, Age, Zipcode, and CivilStatus (4-column layout) */}
                    <div className="lg:col-span-4 grid grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <label className="mb-2 font-medium text-gray-800">Gender <span className="text-red-500">*</span></label>
                            <select
                                name="Gender"
                                value={formik.values.Gender}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`border ${formik.touched.Gender && formik.errors.Gender ? 'border-red-500' : 'border-gray-300'} p-2 bg-gray-100 rounded-md`}
                            >
                                <option value="" label="Select gender" />
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                            {formik.touched.Gender && formik.errors.Gender && (
                                <span className="text-red-500 text-sm">{formik.errors.Gender}</span>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-2 font-medium text-gray-800">Birthday <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="Age"
                                value={formik.values.Age}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}

                                className={`border capitalize  ${formik.touched.Age && formik.errors.Age ? 'border-red-500' : 'border-gray-300'} p-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition duration-200`}
                            />
                            {formik.touched.Age && formik.errors.Age && (
                                <span className="text-red-500 text-sm">{formik.errors.Age}</span>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-2 font-medium text-gray-800">Zipcode <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="Zipcode"
                                value={formik.values.Zipcode}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={'Enter Zipcode'}

                                className={`border capitalize  ${formik.touched.Zipcode && formik.errors.Zipcode ? 'border-red-500' : 'border-gray-300'} p-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition duration-200`}
                            />
                            {formik.touched.Zipcode && formik.errors.Zipcode && (
                                <span className="text-red-500 text-sm">{formik.errors.Zipcode}</span>
                            )}
                        </div>

                        {/* <div className="flex flex-col">
                            <label className="mb-2 font-medium text-gray-800">Civil Status <span className="text-red-500">*</span></label>
                            <select
                                name="CivilStatus"
                                value={formik.values.CivilStatus}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`border capitalize  ${formik.touched.CivilStatus && formik.errors.CivilStatus ? 'border-red-500' : 'border-gray-300'} p-2 bg-gray-100 rounded-md`}
                            >
                                <option value="" label="Select Civil Status" />
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                            {formik.touched.CivilStatus && formik.errors.CivilStatus && (
                                <span className=" capitalize  text-red-500 text-sm">{formik.errors.CivilStatus}</span>
                            )}
                        </div> */}
                    </div>

                    {/* Checkbox agreement */}
                    <div className="flex items-center lg:col-span-4">
                        <input
                            type="checkbox"
                            id="agreement"
                            checked={isAgreed}
                            onChange={(e) => setIsAgreed(e.target.checked)}
                            className=" mr-2"
                        />
                        <label htmlFor="agreement" className="text-sm text-gray-800">
                            I agree to the terms and conditions, including data privacy policies.
                        </label>
                    </div>

                    <div className="flex flex-col  md:col-span-2 lg:col-span-4">
                        <div className="text-sm text-gray-600 mb-4">
                            <p className="italic">
                                Note: The username is the First Name of the user in all uppercase letters.
                            </p>
                            <p className="italic">
                                The password is the Last Name in all uppercase letters.
                            </p>
                        </div>
                        <div className="flex justify-center items-center flex-wrap  ">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-[#ADAAAA] hover:bg-[#D9D9D9] text-white p-2 rounded-md transition duration-200 w-full md:w-auto mt-2 md:mt-0 md:ml-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-[#025373] hover:bg-[#03738C] text-white p-2 rounded-md transition duration-200 w-full md:w-auto mt-2 md:mt-0 md:ml-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span>Loading...</span>
                                ) : (
                                    'Add Patient'
                                )}
                            </button>

                        </div>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AddPatientModal;
