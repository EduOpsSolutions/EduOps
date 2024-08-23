import React from 'react';
import Bg_image from '../../assets/images/Bg2.png';
import SignUpNav from '../../components/navbars/SignUpNav';
import BackButton from '../../components/buttons/BackButton';
import { useNavigate } from 'react-router-dom';


function PaymentForm() {
    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate("/");
    };

    return (
        <section className='flex items-start justify-start flex-col bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh'}}>
        <SignUpNav/>
        <div className="relative max-w-full mx-auto bg-white-yellow-tone w-11/12 px-8 py-4 mt-32 mb-12 flex flex-col">
            <BackButton onClick={navigateToLogin} />
        </div>
        </section>
    )
}

export default PaymentForm