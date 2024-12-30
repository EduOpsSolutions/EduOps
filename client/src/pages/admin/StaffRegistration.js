import React from 'react';
import { useNavigate } from 'react-router-dom';
import Bg_image from '../../assets/images/Bg7.jpg';
import SmallButton from '../../components/buttons/SmallButton';
import LabelledInputField from '../../components/textFields/LabelledInputField';
import SelectField from '../../components/textFields/SelectField';

function StaffRegistration() {
    const navigate = useNavigate();

    // Function to navigate to login page
    const navigateToLogin = () => {
        navigate("/");
    };
    
    // Add any missing options
    const roleOptions = [
        { value: 'teacher', label: 'Teacher' },
        { value: 'admin', label: 'Admin' },
    ];

    return (
        <section className='flex justify-center items-center bg-white-yellow-tone bg-center bg-cover bg-no-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh', backgroundPosition: '100% 35%',}}>
            <div className="relative max-w-1/2 mx-auto bg-white-yellow-tone w-1/2 px-2 py-4 mt-8 mb-8 flex flex-col border-2 border-dark-red-2">
                <form className="px-8 py-4 flex flex-col">
                    <h1 className='text-center text-5xl '>Create Account</h1>
                    <div className='mt-4 mb-2'>
                        <div className="grid md:grid-cols-2 md:gap-6 -mb-2">
                            <LabelledInputField name="first_name" id="first_name" label="First Name" type="text" required={true} placeholder="Enter first name" />
                            <LabelledInputField name="middle_name" id="middle_name" label="Middle Name" type="text" required={true} placeholder="Enter middle name" />
                        </div>
                        <div class="grid md:grid-cols-2 md:gap-6 -mb-2">
                            <LabelledInputField name="last_name" id="last_name" label="Last Name" type="text" required={true} placeholder="Enter last name" />
                            <LabelledInputField name="birthdate" id="birthdate" label="Birthdate" type="date" required={true} />
                        </div>
                        <div class="grid md:grid-cols-2 md:gap-6 -mb-2">
                            <div>
                                <SelectField name="role" id="role" label="Role" required={true} options={roleOptions} />
                            </div>
                            <LabelledInputField name="phone_number" id="phone_number" label="Phone Number" type="tel" required={true} placeholder="+63 9xxxxxxxxxx" />
                        </div>
                        <div className='-mb-2'>
                            <LabelledInputField name="email" id="email" label="E-mail" type="email" required={true} placeholder="johndoe@gmail.com" className=""/>
                        </div>
                        <div className='-mb-2'>
                            <LabelledInputField name="password" id="password" label="Password" type="password" required={true} placeholder="Enter your password" className=""/>
                        </div>
                        <div className='-mb-2'>
                            <LabelledInputField name="confirm_password" id="confirm_password" label="Confirm Password" type="password" required={true} placeholder="Confirm your password" className=""/>
                        </div>
                    </div>

                    {/* Add Onclick function to go to enrollment */}
                    <SmallButton onClick={() => ""}>

                        Register
                    </SmallButton>
                </form>
            </div>
        </section>
    );

}

export default StaffRegistration;
