import Cookies from 'js-cookie';
import React, { useState } from "react";
import John_logo from '../../assets/images/John.jpg';
import Tricia_logo from '../../assets/images/Tricia.png';
import PostTagButton from '../../components/buttons/PostTagButton';
import CreatePostModal from '../../components/modals/home/CreatePostModal';


function Home() {
    const [create_post_modal, setCreatePostModal] = useState(false);

    return (
        <div className="bg_custom bg-white-yellow-tone">
            <div className="relative z-[2]">
                <div className="flex flex-col justify-center items-center">
                {/* DETAILS */}
                <div className="w-[70%] my-16">

                    <div className="flex items-center mb-14">
                        {/* CREATE POST */}
                        <button onClick={() => {setCreatePostModal(true)}} className="flex items-center flex-row w-full bg-white rounded-3xl py-6 px-10 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
                            <img src={John_logo} alt="" className="size-20 border-[3px] border-german-yellow rounded-full me-5" />
                            <p>Create an announcement...</p>
                        </button>

                        {/* ARCHIVE POSTS  */}
                        <a id="archives-button" href="#" className="ms-10 flex flex-col justify-center items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-[70px] drop-shadow-[0px_7px_4px_rgba(0,0,0,.6)]">
                                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                                <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                            </svg>
                            <p className="font-bold">Archives</p>
                        </a>
                    </div>

                    {/* ADMIN POST  */}
                    <div className="mb-10 bg-white rounded-3xl py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
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
                        <PostTagButton tag="global" status="locked" />
                        <div className="font-light">March 4, 2024 - 9:35 AM</div>
                    </div>
                    </div>

                    {/* TEACHER POST */}
                    <div className="bg-white rounded-3xl py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
                    <div className=" grid grid-cols-[auto_1fr_auto] items-center mb-6 gap-x-5">
                        <img src={Tricia_logo} alt="" className="size-20 border-[3px] border-german-yellow rounded-full" />
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
                        <PostTagButton tag="broadcast" status="locked" />
                        <div className="font-light">February 29, 2024 - 3:10 PM</div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            <CreatePostModal
                create_post_modal={create_post_modal}
                setCreatePostModal={setCreatePostModal}
            />
        </div>
    )
}

export default Home