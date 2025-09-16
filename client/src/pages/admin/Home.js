import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import John_logo from '../../assets/images/John.jpg';
import CreatePostModal from '../../components/modals/home/CreatePostModal';
import PostCard from "../../components/post/PostCard";
import usePostsStore from '../../stores/postsStore';

function Home() {
    const [create_post_modal, setCreatePostModal] = useState(false);
    const navigate = useNavigate();

    const {
        getVisiblePosts,
        hidePost,
        unhidePost,
        deletePost,
        fetchPosts,
        isLoading,
        error
    } = usePostsStore();

    // Fetch posts on component mount
    useEffect(() => {
        const loadPosts = async () => {
            try {
                await fetchPosts();
            } catch (err) {
                console.error('Failed to load posts:', err);
            }
        };

        loadPosts();
    }, [fetchPosts]);

    const visiblePosts = getVisiblePosts('admin');

    const handleHidePost = (postId) => {
        hidePost(postId);
        console.log('Post hidden:', postId);
    };

    const handleUnhidePost = (postId) => {
        unhidePost(postId);
        console.log('Post unhidden:', postId);
    };

    const handleDeletePost = (postId) => {
        deletePost(postId);
        console.log('Post deleted:', postId);
    };

    const handleEditPost = (postId) => {
        console.log('Editing post:', postId);
    };

    const handleArchivesClick = () => {
        navigate('/admin/archives');
    };

    return (
        <div className="bg_custom bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="relative z-[2]">
                <div className="flex flex-col justify-center items-center">
                    <div className="w-full max-w-6xl mx-auto my-8 sm:my-12 md:my-16">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-14">
                            <button
                                onClick={() => { setCreatePostModal(true) }}
                                className="flex items-center flex-row w-full bg-white rounded-3xl py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-10 shadow-[0_15px_20px_rgba(0,0,0,0.369)] transition-all duration-200 hover:shadow-[0_18px_24px_rgba(0,0,0,0.4)]"
                            >
                                <img
                                    src={John_logo}
                                    alt=""
                                    className="size-14 sm:size-16 md:size-20 border-[3px] border-german-yellow rounded-full me-3 sm:me-4 md:me-5"
                                />
                                <p className="text-sm sm:text-base md:text-lg">Create an announcement...</p>
                            </button>

                            <button
                                onClick={handleArchivesClick}
                                className="flex-shrink-0 flex flex-col justify-center items-center gap-1 sm:gap-2 transition-transform duration-200 hover:scale-105"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="white"
                                    className="size-[50px] sm:size-[60px] md:size-[70px] drop-shadow-[0px_7px_4px_rgba(0,0,0,.6)]"
                                >
                                    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                                    <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                </svg>
                                <p className="font-bold text-sm sm:text-base md:text-lg">Archives</p>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                <p>{error}</p>
                                <button 
                                    onClick={() => fetchPosts()} 
                                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                                <p className="ml-4 text-gray-600">Loading posts...</p>
                            </div>
                        ) : (
                            <>
                                {visiblePosts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 text-lg">No posts available</p>
                                        <p className="text-gray-500">Create your first post to get started!</p>
                                    </div>
                                ) : (
                                    visiblePosts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            id={post.id}
                                            profilePic={post.profilePic}
                                            postedBy={post.postedBy}
                                            department={post.department}
                                            title={post.title}
                                            content={post.content}
                                            tag={post.tag}
                                            status={post.status}
                                            createdAt={post.createdAt}
                                            updatedAt={post.updatedAt}
                                            isArchived={post.isArchived}
                                            files={post.files} // Add files prop
                                            onHidePost={handleHidePost}
                                            onUnhidePost={handleUnhidePost}
                                            onDeletePost={handleDeletePost}
                                            onEditPost={handleEditPost}
                                            showKebabMenu={true}
                                        />
                                    ))
                                )}
                            </>
                        )}
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