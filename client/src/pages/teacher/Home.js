import React from 'react';
import John_logo from '../../assets/images/John.jpg';
import Tricia_logo from '../../assets/images/Tricia.png';
import PostCard from '../../components/post/PostCard';

function Home() {
    return (
        <div className="bg_custom bg-white-yellow-tone">
            <div className="relative z-[2]">
                <div className="flex flex-col justify-center items-center">
                    {/* News feed area */}
                    <div className="w-[70%] my-16">
                        {/* Replace props with backend logic */}
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
                        
                        {/* Replace props with backend logic */}
                        {/* TEACHER POST */}
                        <PostCard profilePic={Tricia_logo}
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
        </div>
    )
}

export default Home