import React from 'react';
import Bg_image from '../../assets/images/Bg8.png';
import Logo from '../../assets/images/SprachinsLogo.png';

function RedirectPage () {
    return (
    <section className='flex justify-center bg-white-yellow-tone bg-center bg-cover bg-no-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh', backgroundPosition: '100% 35%',}}>
        <div className="relative max-w-full mx-auto w-11/12 px-8 py-4 mt-32 mb-12 flex flex-col">
            <div className='flex justify-center items-center'>
                <img src={Logo} alt="Sprachinstitute" className='w-auto size-[8.5rem]'/>
            </div>
            <div className="flex flex-col justify-center items-center mt-12">
                <p className='text-center mt-4 text-white text-base'>Redirecting to the payment site. If you are not redirected within 5 seconds, {""} 
                <span className='text-german-yellow font-bold cursor-pointer'>
                Click Here
                </span>
                .
                </p>
            </div>
        </div>
    </section>
    )
}

export default RedirectPage