import { create } from 'zustand';
import John_logo from '../assets/images/John.jpg';
import Tricia_logo from '../assets/images/Tricia.png';
import Config from '../utils/config.js';

const createImagePreview = (file) => URL.createObjectURL(file);
const getFileName = (file) => file.name;

const usePostsStore = create((set, get) => ({
    posts: [
        {
            id: 1,
            profilePic: John_logo,
            postedBy: "John Carlo",
            department: "Department Office",
            title: "Test Post",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            tag: "global",
            status: "locked",
            createdAt: "March 4, 2024 - 9:35 AM",
            updatedAt: "",
            isArchived: false
        },
        {
            id: 2,
            profilePic: Tricia_logo,
            postedBy: "Tricia Diaz",
            department: "Department Office",
            title: "Another Post",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            tag: "broadcast",
            status: "locked",
            createdAt: "February 29, 2024 - 3:10 PM",
            updatedAt: "",
            isArchived: false
        },
    ],

    formData: {
        title: '',
        content: '',
        tag: 'global',
        sendOption: 'email',
        selectedImages: [],
        selectedFiles: [],
        showEmojiPicker: false,
        isSubmitting: false,
        editingPostId: null
    },

    // Posts
    getVisiblePosts: () => {
        return get().posts.filter(post => !post.isArchived);
    },

    getArchivedPosts: () => {
        return get().posts.filter(post => post.isArchived);
    },

    hidePost: (postId) => {
        set(state => ({
            posts: state.posts.map(post => 
                post.id === postId ? { ...post, isArchived: true } : post
            )
        }));
    },

    unhidePost: (postId) => {
        set(state => ({
            posts: state.posts.map(post => 
                post.id === postId ? { ...post, isArchived: false } : post
            )
        }));
    },

    deletePost: (postId) => {
        set(state => ({
            posts: state.posts.filter(post => post.id !== postId)
        }));
    },

    // Form
    setTitle: (title) => set(state => ({
        formData: { ...state.formData, title }
    })),

    setContent: (content) => set(state => ({
        formData: { ...state.formData, content }
    })),

    setTag: (tag) => set(state => ({
        formData: { ...state.formData, tag }
    })),

    setSendOption: (sendOption) => set(state => ({
        formData: { ...state.formData, sendOption }
    })),

    toggleTag: () => set(state => ({
        formData: { 
            ...state.formData, 
            tag: state.formData.tag === 'global' ? 'broadcast' : 'global' 
        }
    })),

    addFiles: (files, type) => {
        if (type === 'photo') {
            const imageUrls = files.map(createImagePreview);
            set(state => ({
                formData: {
                    ...state.formData,
                    selectedImages: [...state.formData.selectedImages, ...imageUrls]
                }
            }));
        } else if (type === 'file') {
            const fileNames = files.map(getFileName);
            set(state => ({
                formData: {
                    ...state.formData,
                    selectedFiles: [...state.formData.selectedFiles, ...fileNames]
                }
            }));
        }
    },

    removeImage: (imageUrl) => set(state => ({
        formData: {
            ...state.formData,
            selectedImages: state.formData.selectedImages.filter(img => img !== imageUrl)
        }
    })),

    removeFile: (fileName) => set(state => ({
        formData: {
            ...state.formData,
            selectedFiles: state.formData.selectedFiles.filter(file => file !== fileName)
        }
    })),

    toggleEmojiPicker: () => set(state => ({
        formData: {
            ...state.formData,
            showEmojiPicker: !state.formData.showEmojiPicker
        }
    })),

    closeEmojiPicker: () => set(state => ({
        formData: { ...state.formData, showEmojiPicker: false }
    })),

    insertEmoji: (emoji, textAreaRef) => {
        const { formData } = get();

        if (textAreaRef.current) {
            const { selectionStart, selectionEnd } = textAreaRef.current;
            const updatedContent = formData.content.substring(0, selectionStart) +
                emoji.emoji +
                formData.content.substring(selectionEnd);

            set(state => ({
                formData: {
                    ...state.formData,
                    content: updatedContent,
                    showEmojiPicker: false
                }
            }));

            setTimeout(() => {
                textAreaRef.current.setSelectionRange(
                    selectionStart + emoji.emoji.length,
                    selectionStart + emoji.emoji.length
                );
                textAreaRef.current.focus();
            }, 0);
        }
    },

    validateForm: () => {
        const { formData } = get();

        if (!formData.title.trim() || !formData.content.trim()) {
            return { isValid: false, error: 'Title and content are required' };
        }

        const totalAttachments = formData.selectedImages.length + formData.selectedFiles.length;
        if (totalAttachments > Config.MAX_ATTACHMENTS) {
            return {
                isValid: false,
                error: `You can't upload more than ${Config.MAX_ATTACHMENTS} attachments.`
            };
        }

        return { isValid: true, error: null };
    },

    initializeEditForm: (postData) => {
        set(state => ({
            formData: {
                ...state.formData,
                title: postData.title || '',
                content: postData.content || '',
                tag: postData.tag || 'global',
                sendOption: postData.sendOption || 'email',
                editingPostId: postData.id
            }
        }));
    },

    resetForm: () => set(state => ({
        formData: {
            title: '',
            content: '',
            tag: 'global',
            sendOption: 'email',
            selectedImages: [],
            selectedFiles: [],
            showEmojiPicker: false,
            isSubmitting: false,
            editingPostId: null
        }
    })),

    submitPost: async (onSuccess) => {
        const validation = get().validateForm();

        if (!validation.isValid) {
            console.log(validation.error);
            return false;
        }

        set(state => ({
            formData: { ...state.formData, isSubmitting: true }
        }));

        try {
            const { formData } = get();

            const newPost = {
                profilePic: John_logo,
                postedBy: "John Carlo",
                department: "Department Office",
                title: formData.title,
                content: formData.content,
                tag: formData.tag,
                status: "locked",
                createdAt: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) + ' - ' + new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                updatedAt: "",
                images: formData.selectedImages,
                files: formData.selectedFiles,
                sendOption: formData.sendOption
            };

            set(state => ({
                posts: [{ ...newPost, id: Date.now(), isArchived: false }, ...state.posts]
            }));

            console.log('Post created:', newPost);

            get().resetForm();

            if (onSuccess) onSuccess();
            return true;

        } catch (error) {
            console.error('Error submitting post:', error);
            return false;
        } finally {
            set(state => ({
                formData: { ...state.formData, isSubmitting: false }
            }));
        }
    },

    updatePost: async (postId, onSuccess) => {
        const validation = get().validateForm();

        if (!validation.isValid) {
            console.log(validation.error);
            return false;
        }

        set(state => ({
            formData: { ...state.formData, isSubmitting: true }
        }));

        try {
            const { formData } = get();

            const updatedData = {
                title: formData.title,
                content: formData.content,
                tag: formData.tag,
                sendOption: formData.sendOption,
                updatedAt: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) + ' - ' + new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            set(state => ({
                posts: state.posts.map(post => 
                    post.id === postId ? { ...post, ...updatedData } : post
                )
            }));

            console.log('Post updated:', updatedData);

            get().resetForm();

            if (onSuccess) onSuccess();
            return true;

        } catch (error) {
            console.error('Error updating post:', error);
            return false;
        } finally {
            set(state => ({
                formData: { ...state.formData, isSubmitting: false }
            }));
        }
    },

    hasAttachments: () => {
        const { formData } = get();
        return formData.selectedImages.length > 0 || formData.selectedFiles.length > 0;
    },

    getAttachmentCount: () => {
        const { formData } = get();
        return formData.selectedImages.length + formData.selectedFiles.length;
    }
}));

export default usePostsStore;