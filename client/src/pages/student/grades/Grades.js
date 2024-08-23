import React from 'react';
import Bg_image from '../../../assets/images/Bg2.png';

function Grades() {
    return (
        <section className='flex items-start justify-start flex-row bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh'}}>
            <div className="bg-white-yellow-tone h-full flex flex-col">
                Documents
            </div>
        </section>
    )
}

export default Grades