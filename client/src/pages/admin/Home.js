import React, { useState } from "react";
import John_logo from '../../assets/images/John.jpg';
import Tricia_logo from '../../assets/images/Tricia.png';
import CreatePostModal from '../../components/modals/home/CreatePostModal';
import PostCard from "../../components/post/PostCard";

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
                        <PostCard
                            profilePic={John_logo}
                            postedBy="John Carlo"
                            department="Department Office"
                            title="Test Post"
                            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                            tag="global"
                            status="locked"
                            createdAt="March 4, 2024 - 9:35 AM"
                            updatedAt=""
                        />
                        
                        {/* TEACHER POST */}
                        <PostCard
                            profilePic={Tricia_logo}
                            postedBy="Tricia Diaz"
                            department="Department Office"
                            title="Another Post"
                            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                            tag="broadcast"
                            status="locked"
                            createdAt="February 29, 2024 - 3:10 PM"
                        />

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