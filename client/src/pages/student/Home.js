import React, { useEffect } from 'react';
import PostCard from '../../components/post/PostCard';
import usePostsStore from '../../stores/postsStore';
import Pagination from '../../components/common/Pagination';



function Home() {
  const { getVisiblePosts, fetchPosts } = usePostsStore();
  const visiblePosts = getVisiblePosts('student');

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const totalPages = Math.ceil(visiblePosts.length / itemsPerPage);
  const paginatedPosts = visiblePosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg_custom bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
      {visiblePosts.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-8">No posts available</div>
      ) : (
        <>
          {paginatedPosts.map(post => (
            <PostCard
              key={post.id}
              {...post}
              showKebabMenu={false}
            />
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={visiblePosts.length}
            itemName="posts"
          />
        </>
      )}
    </div>
  );
}

export default Home;