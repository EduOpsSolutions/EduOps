import React, { useState, useRef, useEffect } from 'react';
import usePostsStore from '../../stores/postsStore';
import PostTagButton from '../buttons/PostTagButton';
import EditPostModal from '../modals/home/EditPostModal';
import Swal from 'sweetalert2';

// Modal for viewing images in full size
const ImageModal = ({ isOpen, onClose, imageUrl, imageName }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div className="relative max-w-full max-h-full">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img 
                    src={imageUrl} 
                    alt={imageName || 'Full size image'} 
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
                {imageName && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white text-center p-2 rounded">
                        {imageName}
                    </div>
                )}
            </div>
        </div>
    );
};

// Component to render individual file attachments
const FileAttachment = ({ file, onImageClick }) => {
    const isImage = file.fileType?.startsWith('image/');
    
    if (isImage) {
        return (
            <div className="relative group">
                <div 
                    className="w-48 h-32 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => onImageClick(file.url, file.fileName)}
                >
                    <img 
                        src={file.url} 
                        alt={file.fileName || 'Post image'} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                </div>
                {file.fileName && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.fileName}
                    </div>
                )} 
            </div> 
        );
    }
    
    // For non-image files, show a download link
    return (
        <div className="flex items-center p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-4.5B4.125 8.25 3 9.375 3 10.5v2.625a3.375 3.375 0 003.375 3.375h4.5a3.375 3.375 0 003.375-3.375v-2.625z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
                </svg>
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName || 'Download file'}
                </p>
                <p className="text-xs text-gray-500">
                    {file.fileType} {file.fileSize && `• ${(file.fileSize / 1024 / 1024).toFixed(2)} MB`}
                </p>
            </div>
            <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-3 flex-shrink-0 text-blue-600 hover:text-blue-800"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            </a>
        </div>
    );
};

// Component to render all file attachments
const PostAttachments = ({ files }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    if (!files || files.length === 0) return null;
    
    const images = files.filter(file => file.fileType?.startsWith('image/'));
    const documents = files.filter(file => !file.fileType?.startsWith('image/'));
    
    const handleImageClick = (imageUrl, imageName) => {
        setSelectedImage({ url: imageUrl, name: imageName });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };
    
    return (
        <div className="mb-6">
            {/* Images Grid */}
            {images.length > 0 && (
                <div className={`grid gap-3 mb-4 justify-start ${
                    images.length === 1 ? 'grid-cols-1 max-w-48' :
                    images.length === 2 ? 'grid-cols-2' :
                    images.length === 3 ? 'grid-cols-3' :
                    'grid-cols-2 md:grid-cols-3'
                }`}>
                    {images.map((file, index) => (
                        <FileAttachment 
                            key={file.id || index} 
                            file={file} 
                            onImageClick={handleImageClick}
                        />
                    ))}
                </div>
            )}
            
            {/* Document Files */}
            {documents.length > 0 && (
                <div className="grid gap-3 mb-4 justify-start">
                    {documents.map((file, index) => (
                        <FileAttachment key={file.id || index} file={file} />
                    ))}
                </div>
            )}
            
            {/* Image Modal */}
            <ImageModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                imageUrl={selectedImage?.url}
                imageName={selectedImage?.name}
            />
        </div>
    );
};

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
    files = [], // Add files prop
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
        updatedAt,
        files // Add files to postData
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
                <div className="text-justify mb-6">{content}</div>
                
                {/* File Attachments */}
                <PostAttachments files={files} />
                
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