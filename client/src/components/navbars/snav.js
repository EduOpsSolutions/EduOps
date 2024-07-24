import React from 'react';
import logo from '../../assets/images/SprachinsLogo.png';

function snav() {
    return (
        <nav class="bg-german-red dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b-[5px] border-dark-red-2">
            <div class="flex flex-wrap items-center justify-between mx-auto p-2 ml-4">
                <a href="/" class="flex">
                    <img src={logo} class="h-14 w-auto" alt="Flowbite Logo"></img>
                </a>
            </div>
        </nav>
    )
}

export default snav