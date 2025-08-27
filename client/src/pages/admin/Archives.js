import React from "react";
import PostCard from "../../components/post/PostCard";
import usePostsStore from '../../stores/postsStore';

function Archives() {

    const {
        getArchivedPosts,
        unhidePost,
        deletePost
    } = usePostsStore();

    const archivedPosts = getArchivedPosts();

    const handleUnhidePost = (postId) => {
        unhidePost(postId);
        console.log('Post unhidden and moved back to home:', postId);
    };

    const handleDeletePost = (postId) => {
        deletePost(postId);
        console.log('Post deleted from archives:', postId);
    };

    return (
        <div className="bg_custom bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="relative z-[2]">
                <div className="flex flex-col justify-center items-center">
                    <div className="w-full max-w-6xl mx-auto my-4 sm:my-6 md:my-8">
                        <div className="bg-white rounded-3xl py-6 px-8 mb-8 shadow-lg">
                            <div className="flex items-center justify-center">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                                    Archived Posts
                                </h1>
                            </div>
                        </div>

                        {archivedPosts.length > 0 ? (
                            archivedPosts.map((post) => (
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
                                    onHidePost={() => { }}
                                    onUnhidePost={handleUnhidePost}
                                    onDeletePost={handleDeletePost}
                                    showKebabMenu={true}
                                />
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl py-16 px-8 text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                                >
                                    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                                    <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                </svg>
                                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Archived Posts</h2>
                                <p className="text-gray-500">Posts that are hidden will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Archives;