import React from 'react';
import { useNavigate } from 'react-router-dom';
import Bg_image from '../../assets/images/Bg7.jpg';
import BackButton from '../../components/buttons/BackButton';
import SmallButton from '../../components/buttons/SmallButton';
import SignUpNav from '../../components/navbars/SignUpNav';
import FileUploadButton from '../../components/textFields/FileUploadButton';
import LabelledInputField from '../../components/textFields/LabelledInputField';
import NotLabelledInputField from '../../components/textFields/NotLabelledInputField';
import SelectField from '../../components/textFields/SelectField';

function SignUp() {
    const navigate = useNavigate();

    // Function to navigate to login page
    const navigateToLogin = () => {
        navigate("/");
    };

    // Add any missing options
    const civilStatusOptions = [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' }
    ];

    // Please check if reffered by options are complete and add the missing fields
    const referredByOptions = [
        { value: 'family', label: 'Family'},
        { value: 'colleague', label: 'Colleague'},
        { value: 'social media', label: 'Social Media'},
        { value: 'website', label: 'Website'},
        { value: 'other', label: 'Other'}
    ];

    // Replace with back-end logic for all avail course options
    const courseOptions = [
        { value: 'A1', label: 'A1'},
        { value: 'A2', label: 'A2'},
        { value: 'B1', label: 'B1'},
        { value: 'B2', label: 'B2'},
        { value: 'C1', label: 'C1'},
        { value: 'C2', label: 'C2'}
    ];


    return (
        <section className='flex justify-center items-center bg-white-yellow-tone bg-center bg-cover bg-no-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh', backgroundPosition: '100% 35%',}}>
            <SignUpNav />
            <div className="relative max-w-full mx-auto bg-white-yellow-tone w-11/12 px-8 py-4 mt-32 mb-12 flex flex-col">
                <BackButton onClick={navigateToLogin} />
                <form className="px-8 py-4 flex flex-col">
                    <h1 className='text-center text-3xl font-bold'>Enrollment Form</h1>
                    <p className='italic mb-5'>Items with (*) are required fields</p>
                    <div className="grid md:grid-cols-3 md:gap-6">
                        <NotLabelledInputField name="first_name" id="first_name" label="First name*" type="text" required={true} />
                        <NotLabelledInputField name="middle_name" id="middle_name" label="Middle name*" type="text" required={true} />
                        <NotLabelledInputField name="last_name" id="last_name" label="Last name*" type="text" required={true} />
                    </div>
                    <div class="grid md:grid-cols-4 md:gap-6">
                        <LabelledInputField name="extensions" id="extensions" label="Extensions" type="text" required={false} placeholder="Jr., Sr. III" />
                        <div class="grid md:grid-cols-2 md:gap-6">
                            <LabelledInputField name="honorrific" id="honorrific" label="Honorrific*" type="text" required={true} placeholder="Mr., Ms" />
                            <LabelledInputField name="sex" id="sex" label="Sex*" type="text" required={true} placeholder="M/F" />
                        </div>
                        <LabelledInputField name="birthdate" id="birthdate" label="Birth Date*" type="date" required={true} />
                        <SelectField name="civil_status" id="civil_status" label="Civil Status*" required={true} options={civilStatusOptions} />
                    </div>
                    <div class="grid md:grid-cols-3 md:gap-6">
                        <div className="col-span-2">
                            <LabelledInputField name="address" id="address" label="Current Address*" type="text" required={true} placeholder="Street, Barangay, City, Province, Zip Code" />
                        </div>
                        <div className="col-span-1">
                            <SelectField name="referred_by" id="referred_by" label="Referred By*" required={true} options={referredByOptions} />
                        </div>
                    </div>
                    <div class="grid md:grid-cols-2 md:gap-6">
                        <LabelledInputField name="contact_number" id="contact_number" label="Contact Number*" type="tel" required={true} placeholder="+63 9xxxxxxxxxx" />
                        <LabelledInputField name="alt_contact_number" id="alt_contact_number" label="Alternate Contact Number" type="tel" required={false} placeholder="+63 9xxxxxxxxxx" />
                    </div>
                    <div class="grid md:grid-cols-2 md:gap-6">
                        <LabelledInputField name="preferred_email" id="preferred_email" label="Preferred Email Address*" type="email" required={true} placeholder="johndoe@gmail.com" />
                        <LabelledInputField name="alt_email" id="alt_email" label="Alternate Email Address" type="email" required={false} placeholder="example@gmail.com" />
                    </div>
                    <div class="grid md:grid-cols-3 md:gap-6">
                        <LabelledInputField name="mother_name" id="mother_name" label="Mother's Maiden Full Name" type="text" required={false} placeholder="" />
                        <div class="grid md:grid-cols-2 md:gap-6">
                            <div className="flex flex-col items-center">
                                <label htmlFor="deceased" className="mb-2 text-sm font-medium dark:text-white">
                                Deceased?
                                </label>
                                <input type="checkbox" name="mother_deceased" id="mother_deceased" className="peer mt-3 text-dark-red focus:border-dark-red focus:ring-dark-red-2" />
                            </div>
                            <LabelledInputField name="mother_contact_number" id="mother_contact_number" label="Contact Number" type="tel" required={false} placeholder="+63 9xxxxxxxxxx" />
                        </div>
                    </div>
                    <div class="grid md:grid-cols-3 md:gap-6">
                        <LabelledInputField name="father_name" id="father_name" label="Father's Full Name" type="text" required={false} placeholder="" />
                        <div class="grid md:grid-cols-2 md:gap-6">
                            <div className="flex justify-center items-center">
                                <input type="checkbox" name="father_deceased" id="father_deceased" className="peer text-dark-red focus:border-dark-red focus:ring-dark-red-2" />
                            </div>
                            <LabelledInputField name="father_contact_number" id="father_contact_number" label="Contact Number" type="tel" required={false} placeholder="+63 9xxxxxxxxxx" />
                        </div>
                    </div>
                    <div class="grid md:grid-cols-3 md:gap-6">
                        <LabelledInputField name="guardian_name" id="guardian_name" label="Guardian's Full Name" type="text" required={false} placeholder="" />
                        <div class="grid md:grid-cols-2 md:gap-6">
                            <div className="flex justify-center items-center">
                                <input type="checkbox" name="guardian_deceased" id="guardian_deceased" className="peer text-dark-red focus:border-dark-red focus:ring-dark-red-2" />
                            </div>
                            <LabelledInputField name="mother_contact_number" id="mother_contact_number" label="Contact Number" type="tel" required={false} placeholder="+63 9xxxxxxxxxx" />
                        </div>
                    </div>

                    {/* Temporary code. Replace with actual logic to select courses like modal or someth */}
                    <div class="grid md:grid-cols-3 md:gap-6">
                        <div>
                            <SelectField name="courses_to_enroll" id="courses_to_enroll" label="Select Course(s) to Enroll* [TEMPORARY]" required={true} options={courseOptions} />
                        </div>
                    </div>

                    {/* Need to find way how to change the add file button's color to red from gray */}
                    <FileUploadButton label="Upload Valid ID (front and back)" id="valid_id" ariaDescribedBy="valid_id_help" />
                    <FileUploadButton label="Upload 2X2 ID Photo (white background)" id="2x2_id" ariaDescribedBy="2x2_id_help" />
                    {/* Add Onclick function to go to enrollment */}
                    <SmallButton onClick={() => {}}>
                        Proceed
                    </SmallButton>
                </form>
            </div>
        </section>
    );

}

export default SignUp;
