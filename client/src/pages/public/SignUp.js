import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Bg_image from '../../assets/images/Bg7.jpg';
import SmallButton from '../../components/buttons/SmallButton';
import UserNavbar from '../../components/navbars/UserNav';
import FileUploadButton from '../../components/textFields/FileUploadButton';
import LabelledInputField from '../../components/textFields/LabelledInputField';
import NotLabelledInputField from '../../components/textFields/NotLabelledInputField';
import SelectField from '../../components/textFields/SelectField';

function SignUp() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add any missing options
    const civilStatusOptions = [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' }
    ];

    // Please check if reffered by options are complete and add the missing fields
    const referredByOptions = [
        { value: 'family', label: 'Family' },
        { value: 'colleague', label: 'Colleague' },
        { value: 'social media', label: 'Social Media' },
        { value: 'website', label: 'Website' },
        { value: 'other', label: 'Other' }
    ];

    // Replace with back-end logic for all avail course options
    const courseOptions = [
        { value: 'A1', label: 'A1' },
        { value: 'A2', label: 'A2' },
        { value: 'B1', label: 'B1' },
        { value: 'B2', label: 'B2' },
        { value: 'C1', label: 'C1' },
        { value: 'C2', label: 'C2' }
    ];

    const [validId, setValidId] = useState(null);
    const [idPhoto, setIdPhoto] = useState(null);

    const handleFileChange = (event, setFile) => {
        const file = event.target.files[0];
        setFile(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.target);
        const enrollmentData = {};

        try {
            if (!validId || !idPhoto) {
                throw new Error('Both Valid ID and 2x2 ID Photo are required');
            }

            const uploadFile = async (file, category) => {
                const fileFormData = new FormData();
                fileFormData.append('file', file);
                fileFormData.append('category', category);

                const response = await fetch('http://localhost:5555/api/v1/files/upload', {
                    method: 'POST',
                    body: fileFormData
                });

                const result = await response.json();
                if (!result.data || !result.data.fileUrl) {
                    throw new Error(`Invalid ${category} upload response`);
                }

                return result.data.fileUrl;
            };

            // Upload files
            enrollmentData.validIdPath = await uploadFile(validId, 'ValidId');
            enrollmentData.idPhotoPath = await uploadFile(idPhoto, 'IdPhoto');

            for (let [key, value] of formData.entries()) {
                if (key !== 'validIdPath' && key !== 'idPhotoPath') {
                    enrollmentData[key] = value;
                }
            }

            const response = await fetch('http://localhost:5555/api/v1/enrollment/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrollmentData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            alert('Enrollment form submitted successfully!');
            navigate('/enrollment'); //temporary

        } catch (error) {
            console.error('Error details:', error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <UserNavbar role="public" />
            <section className='flex justify-center items-center bg-white-yellow-tone bg-center bg-cover bg-no-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh', backgroundPosition: '100% 35%', }}>
                <div className="relative max-w-full mx-auto bg-white-yellow-tone w-11/12 px-8 py-4 mt-8 mb-12 flex flex-col">
                    <form className="px-8 py-4 flex flex-col" onSubmit={handleSubmit}>
                        <h1 className='text-center text-3xl font-bold'>Enrollment Form</h1>
                        <p className='italic mb-5 font-semibold'>Items with (*) are required fields</p>
                        <div className="grid md:grid-cols-3 md:gap-6">
                            <NotLabelledInputField name="firstName" id="first_name" label="First name*" type="text" required={true} />
                            <NotLabelledInputField name="middleName" id="middle_name" label="Middle name*" type="text" required={true} />
                            <NotLabelledInputField name="lastName" id="last_name" label="Last name*" type="text" required={true} />
                        </div>
                        <div className="grid md:grid-cols-4 md:gap-6">
                            <LabelledInputField name="extensions" id="extensions" label="Extensions" type="text" required={false} placeholder="Jr., Sr. III" />
                            <div className="grid md:grid-cols-2 md:gap-6">
                                <LabelledInputField name="honorrific" id="honorrific" label="Honorrific*" type="text" required={true} placeholder="Mr., Ms" />
                                <LabelledInputField name="sex" id="sex" label="Sex*" type="text" required={true} placeholder="M/F" />
                            </div>
                            <LabelledInputField name="birthDate" id="birthdate" label="Birth Date*" type="date" required={true} />
                            <SelectField name="civilStatus" id="civil_status" label="Civil Status*" required={true} options={civilStatusOptions} />
                        </div>
                        <div className="grid md:grid-cols-3 md:gap-6">
                            <div className="col-span-2">
                                <LabelledInputField name="address" id="address" label="Current Address*" type="text" required={true} placeholder="Street, Barangay, City, Province, Zip Code" />
                            </div>
                            <div className="col-span-1">
                                <SelectField name="referredBy" id="referred_by" label="Referred By*" required={true} options={referredByOptions} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <LabelledInputField name="contactNumber" id="contact_number" label="Contact Number*" type="tel" required={true} placeholder="+63 9xxxxxxxxxx" />
                            <LabelledInputField name="altContactNumber" id="alt_contact_number" label="Alternate Contact Number" type="tel" required={false} placeholder="+63 9xxxxxxxxxx" />
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <LabelledInputField name="preferredEmail" id="preferred_email" label="Preferred Email Address*" type="email" required={true} placeholder="johndoe@gmail.com" />
                            <LabelledInputField name="altEmail" id="alt_email" label="Alternate Email Address" type="email" required={false} placeholder="example@gmail.com" />
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <LabelledInputField name="motherName" id="mother_name" label="Mother's Maiden Full Name" type="text" required={false} placeholder="" />
                            <LabelledInputField name="motherContact" id="mother_contact_number" label="Contact Number" type="tel" required={false} placeholder="+63 9xxxxxxxxxx" />
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <LabelledInputField name="fatherName" id="father_name" label="Father's Full Name" type="text" required={false} placeholder="" />
                            <LabelledInputField name="fatherContact" id="father_contact_number" label="Contact Number" type="tel" required={false} placeholder="+63 9xxxxxxxxxx" />
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <LabelledInputField name="guardianName" id="guardian_name" label="Guardian's Full Name" type="text" required={false} placeholder="" />
                            <LabelledInputField name="guardianContact" id="guardian_contact_number" label="Contact Number" type="tel" required={false} placeholder="+63 9xxxxxxxxxx" />
                        </div>

                        {/* Temporary code. Replace with actual logic to select courses like modal or someth */}
                        <div className="grid md:grid-cols-3 md:gap-6">
                            <div>
                                <SelectField name="coursesToEnroll" id="courses_to_enroll" label="Select Course(s) to Enroll* [TEMPORARY]" required={true} options={courseOptions} />
                            </div>
                        </div>

                        <FileUploadButton
                            label="Upload Valid ID (front and back)*"
                            id="validId"
                            name="validIdPath"
                            onChange={(e) => handleFileChange(e, setValidId)}
                            ariaDescribedBy="valid_id_help"
                        />
                        <FileUploadButton
                            label="Upload 2X2 ID Photo (white background)*"
                            id="idPhoto"
                            name="idPhotoPath"
                            onChange={(e) => handleFileChange(e, setIdPhoto)}
                            ariaDescribedBy="2x2_id_help"
                        />
                        {/* Button navigates to enrollment page after submission */}
                        <SmallButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Proceed'}
                        </SmallButton>
                    </form>
                </div>
            </section>
        </>
    );
}

export default SignUp;