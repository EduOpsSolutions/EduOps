import React from 'react';
import { useNavigate } from 'react-router-dom';
import Bg_image from '../../assets/images/Bg2.png';
import BackButton from '../../components/buttons/BackButton';
import SignUpNav from '../../components/navbars/SignUpNav';


function PaymentForm() {
    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate("/");
    };

    return (
        <section className='flex justify-start bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh'}}>
            <SignUpNav/>
            <div className="flex flex-col relative max-w-full mx-auto bg-white-yellow-tone w-11/12 px-8 py-4 mt-32 mb-12">
                <BackButton onClick={navigateToLogin} />
            </div>
        </section>
    )
}

export default PaymentForm