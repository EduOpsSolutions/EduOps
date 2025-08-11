import React from 'react';
import PostCard from '../../components/post/PostCard';
import usePostsStore from '../../stores/postsStore';

function Home() {
    const { getVisiblePosts } = usePostsStore();
    const visiblePosts = getVisiblePosts();

    return (
        <div className="bg_custom bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
            {visiblePosts.map(post => (
                <PostCard key={post.id} {...post} showKebabMenu={false} />
            ))}
        </div>
    );
}

export default Home;