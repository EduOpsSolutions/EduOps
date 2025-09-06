import React, { useState, useRef, useEffect } from 'react';
import usePostsStore from '../../stores/postsStore';
import PostTagButton from '../buttons/PostTagButton';
import EditPostModal from '../modals/home/EditPostModal';
import Swal from 'sweetalert2';

const PostCard = ({
    id,
    profilePic,
    postedBy,
    department,
    title,
    content,
    tag,
    status,
    createdAt,
    updatedAt,
    isArchived = false,
    onHidePost,
    onUnhidePost,
    onDeletePost,
    onEditPost,
    showKebabMenu = false
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [editPostModal, setEditPostModal] = useState(false);
    const { initializeEditForm } = usePostsStore();
    const kebabMenuRef = useRef(null);

    const postData = {
        id,
        title,
        content,
        tag,
        profilePic,
        postedBy,
        department,
        createdAt,
        updatedAt
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (kebabMenuRef.current && !kebabMenuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleEditPost = () => {
        initializeEditForm(postData);
        setEditPostModal(true);
        setShowMenu(false);
        if (onEditPost) onEditPost(id);
    };

    const handleDeletePost = async () => {
        const result = await Swal.fire({
            title: 'Delete Post',
            text: 'Are you sure you want to delete this post? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            if (onDeletePost) onDeletePost(id);
            Swal.fire({
                title: 'Deleted!',
                text: 'The post has been deleted successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
        setShowMenu(false);
    };

    const handleHidePost = async () => {
        if (onHidePost) {
            await onHidePost(id);
            Swal.fire({
                title: 'Post Hidden',
                text: 'The post has been hidden successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
        setShowMenu(false);
    };

    const handleUnhidePost = async () => {
        if (onUnhidePost) {
            await onUnhidePost(id);
            Swal.fire({
                title: 'Post Unhidden',
                text: 'The post is now visible again.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
        setShowMenu(false);
    };

    return (
        <>
            <div className="mb-10 bg-white rounded-3xl py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
                <div className="grid grid-cols-[auto_1fr_auto] items-center mb-6 gap-x-6">
                    <img src={profilePic} alt={`${postedBy} logo`} className="size-20 border-[3px] border-german-yellow rounded-full" />
                    <div>
                        <div className="font-bold">{postedBy}</div>
                        <p>{department}</p>
                    </div>

                    {showKebabMenu && (
                        <div className="relative" ref={kebabMenuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center w-6 h-6 space-y-1">
                                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                </div>
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                    <div className="py-1">
                                        <button
                                            onClick={handleEditPost}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                                            </svg>
                                            Edit post
                                        </button>

                                        <button
                                            onClick={handleDeletePost}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                                            </svg>
                                            Delete post
                                        </button>

                                        {isArchived ? (
                                            <button
                                                onClick={handleUnhidePost}
                                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                                                </svg>
                                                Unhide post
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleHidePost}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                                                    <path d="M10.503 7.224a5.25 5.25 0 016.273 6.273l-6.273-6.273zM1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75a10.21 10.21 0 012.61.33l-2.318 2.318A7.75 7.75 0 004.918 12c0 .797.12 1.563.343 2.287L1.323 11.447z" />
                                                </svg>
                                                Hide post
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="text-3xl mb-[15px]">{title}</div>
                <div className="text-justify mb-9">{content}</div>
                <div className="flex flex-row justify-between items-end">
                    <PostTagButton tag={tag} status={status} />
                    <div className="font-light">{createdAt}</div>
                </div>
            </div>

            <EditPostModal
                edit_post_modal={editPostModal}
                setEditPostModal={setEditPostModal}
                postData={postData}
            />
        </>
    );
};

export default PostCard;