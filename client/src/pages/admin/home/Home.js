import Cookies from 'js-cookie';
import React from 'react';
import John_logo from '../../../assets/images/John.jpg';
import Tricia_logo from '../../../assets/images/Tricia.png';
import BroadcastTag from '../../../components/buttons/BroadcastTag';
import GlobalTag from '../../../components/buttons/GlobalTag';


function Home() {
  console.log(Cookies.get("token")); // delete this, jsut testing
return (
    <div class="bg_custom bg-white-yellow-tone">
        <div class="relative z-[2]">
            <div className="flex flex-col justify-center items-center">
            {/* DETAILS */}
            <div className="w-[70%] my-16">

                {/* ADMIN POST  */}
                <div className="mb-14 bg-white rounded-3xl py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
                <div className=" grid grid-cols-[auto_1fr_auto] items-center mb-6 gap-x-6">
                    <img src={John_logo} alt="" className="size-20 border-[3px] border-german-yellow rounded-full" />
                    <div>
                        <div className="font-bold">John Carlo</div>
                        <p>Department Office</p>
                    </div>
                </div>
                <div className="text-3xl mb-[15px]">Test Post</div>
                <div className="text-justify mb-9">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </div>
                <div className="flex flex-row justify-between items-end">
                    <GlobalTag />
                    <div className="font-light">March 4, 2024 - 9:35 AM</div>
                </div>
                </div>

                {/* TEACHER POST */}
                <div className="bg-white rounded-3xl py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
                <div className=" grid grid-cols-[auto_1fr_auto] items-center mb-6 gap-x-5">
                    <img src={Tricia_logo} alt="" class="size-20 border-[3px] border-german-yellow rounded-full" />
                    <div>
                    <div className="font-bold">Tricia Diaz</div>
                    <p>Department Office</p>
                    </div>
                </div>
                <div className="text-3xl mb-[15px]"></div>
                <div className="text-justify mb-9">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </div>
                <div className="flex flex-row justify-between items-end">
                    <BroadcastTag />
                    <div className="font-light">February 29, 2024 - 3:10 PM</div>
                </div>
                </div>

            </div>
            </div>
        </div>
    </div>
)
}

export default Home