import { create } from 'zustand';
import Config from '../utils/config.js';
import { 
  POST_TAGS, 
  USER_ROLES,
  initialPosts,
  defaultFormData,
  createImagePreview,
  getFileName,
  getNextTag,
  createPostObject,
  createUpdatedPostData,
  isPostVisibleToRole as checkPostVisibility,
  filterVisiblePosts,
  filterArchivedPosts,
  validatePostForm
} from './postsStoreState';

const usePostsStore = create((set, get) => ({
    posts: initialPosts,
    formData: { ...defaultFormData },
    
    defaultFormData: {
        title: '',
        content: '',
        tag: POST_TAGS.GLOBAL,
        sendOption: 'email',
        selectedImages: [],
        selectedFiles: [],
        showEmojiPicker: false,
        isSubmitting: false,
        editingPostId: null
    },

    // Posts section
    /**
     * Returns posts that should be visible to a user based on their role and post tags
     * @param {string} userRole 
     * @returns {Array} 
     */
    getVisiblePosts: (userRole = USER_ROLES.GUEST) => {
        return filterVisiblePosts(get().posts, userRole);
    },

    getArchivedPosts: () => {
        return filterArchivedPosts(get().posts);
    },

    hidePost: (postId) => {
        set(state => ({
            posts: state.posts.map(post => 
                post.id === postId ? { ...post, isArchived: true } : post
            )
        }));
        return true;
    },

    unhidePost: (postId) => {
        set(state => ({
            posts: state.posts.map(post => 
                post.id === postId ? { ...post, isArchived: false } : post
            )
        }));
        return true;
    },

    deletePost: (postId) => {
        set(state => ({
            posts: state.posts.filter(post => post.id !== postId)
        }));
        return true;
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

    /**
     * Cycles through available post tags in a predefined order
     * @returns {Object}
     */
    toggleTag: () => set(state => {
        const currentTag = state.formData.tag;
        const nextTag = getNextTag(currentTag);
        
        return {
            formData: { 
                ...state.formData, 
                tag: nextTag
            }
        };
    }),

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

    /**
     * Validates the form data before submission
     * @returns {Object} 
     */
    validateForm: () => {
        const { formData } = get();
        return validatePostForm(formData, Config.MAX_ATTACHMENTS);
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

    resetForm: () => set(() => ({
        formData: { ...defaultFormData }
    })),

    /**
     * Creates and submits a new post
     * @param {Function} onSuccess 
     * @returns {Promise<boolean>}
     */
    submitPost: async (onSuccess) => {
        if (typeof onSuccess !== 'function' && onSuccess !== undefined) {
            onSuccess = undefined;
        }

        const validation = get().validateForm();
        if (!validation.isValid) {
            console.log('Form validation failed:', validation.error);
            return false;
        }

        set(state => ({
            formData: { ...state.formData, isSubmitting: true }
        }));

        try {
            const { formData } = get();

            const newPost = createPostObject(formData);

            set(state => ({
                posts: [newPost, ...state.posts]
            }));

            console.log('Post created successfully:', newPost);

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
        if (typeof onSuccess !== 'function' && onSuccess !== undefined) {
            onSuccess = undefined;
        }
        
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
            
            const updatedData = createUpdatedPostData(formData);

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
    },
    
    /**
     * Get all posts that a specific user role should be able to see
     * @param {string} userRole 
     * @param {boolean} includeArchived 
     * @returns {Array} 
     */
    getPostsForUser: (userRole = USER_ROLES.GUEST, includeArchived = false) => {
        const visiblePosts = get().getVisiblePosts(userRole);

        if (userRole === USER_ROLES.ADMIN && includeArchived) {
            const archivedPosts = filterArchivedPosts(get().posts);
            return [...visiblePosts, ...archivedPosts];
        }
        
        return visiblePosts;
    },
    
    /**
     * Determines if a specific post should be visible to a user with the given role
     * @param {number|string} postId 
     * @param {string} userRole 
     * @returns {boolean} 
     */
    isPostVisibleToRole: (postId, userRole = USER_ROLES.GUEST) => {
        const post = get().posts.find(p => p.id === postId);
        return checkPostVisibility(post, userRole);
    },

    getState: () => {
        return {
            posts: get().posts,
            formData: get().formData
        };
    },
    
}));

export default usePostsStore;