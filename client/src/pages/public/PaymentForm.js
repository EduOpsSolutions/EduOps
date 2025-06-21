import React from 'react';
import { useNavigate } from 'react-router-dom';
import Bg_image from '../../assets/images/Bg2.png';
import BackButton from '../../components/buttons/BackButton';
import SmallButton from '../../components/buttons/SmallButton';
import UserNavbar from '../../components/navbars/UserNav';
import LabelledInputField from '../../components/textFields/LabelledInputField';
import SelectField from '../../components/textFields/SelectField';

function PaymentForm() {
    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate("/");
    };
    const navigateToRedirectPage = () => {
        navigate("/redirectPage");
    };
    

    const feesOptions = [
        { value: 'course_fee', label: 'Course Fee' },
        { value: 'book_fee', label: 'Book Fee' },
        { value: 'document_fee', label: 'Document Fee' }
    ];


    return (
        <section className='flex justify-start bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh'}}>
            <UserNavbar role="public" />

            <div className='flex flex-col justify-center items-center w-full'>
                <div className="relative bg-white-yellow-tone w-11/12 px-8 py-4 mt-24 mb-auto rounded-xl border-2 border-dark-red shadow-2xl md:min-h-[580px] h-auto flex flex-col">
                    <BackButton onClick={navigateToLogin} />
                        <form className="px-8 py-4 flex flex-col">
                            <h1 className='text-center text-3xl font-bold -mb-2'>Maya Payment Form</h1>
                            <hr className='my-8  border-dark-red'/>
                            <p className='-mt-4 mb-5 font-semibold'>Please enter valid information.</p>
                            <div className="grid md:grid-cols-3 md:gap-10">
                                <LabelledInputField name="first_name" id="first_name" label="First Name" type="text" required={true} placeholder="First Name" />
                                <LabelledInputField name="middle_name" id="middle_name" label="Middle Name" type="text" required={true} placeholder="Middle Name"/>
                                <LabelledInputField name="last_name" id="last_name" label="Last Name" type="text" required={true} placeholder="Last Name"/>
                            </div>
                            <div className="grid md:grid-cols-3 md:gap-10">
                                <LabelledInputField name="email_address" id="email_address" label="Email Address" type="text" required={true} placeholder="johndoe@gmail.com" />
                                <LabelledInputField name="phone_number" id="phone_number" label="Phone Number" type="tel" required={true} placeholder="+63 9xxxxxxxxxx"/>
                            </div>
                            <hr className='mt-2 mb-8 border-dark-red'/>
                            <p className='-mt-4 mb-5 font-semibold'>Type of Fees.</p>
                            <div className="grid md:grid-cols-3 md:gap-10">
                                <SelectField name="fee" id="fee" label="Fee" required={true} options={feesOptions} />
                                <LabelledInputField name="amount" id="amount" label="Amount" type="text" required={true} placeholder="0.00" />
                            </div>
                        </form>
                    <div className='justify-end self-end'>
                        <SmallButton onClick={navigateToRedirectPage}>
                            Submit
                        </SmallButton>
                    </div>
                </div>
            </div> 
        </section>
    )
}

export default PaymentForm