import { create } from 'zustand';
import Config from '../utils/config.js';
import POSTS_API, { formatPostData, formatBackendPost } from '../utils/postsApi.js';
import { 
  POST_TAGS, 
  USER_ROLES,
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
    posts: [],
    formData: { ...defaultFormData },
    isLoading: false,
    error: null,
    actualFiles: [], // Store actual File objects for upload
    existingFiles: [], // Store existing files from the post being edited
    filesToDelete: [], // Track files marked for deletion
    
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

    // API Actions
    /**
     * Fetch all posts from backend
     * @param {Object} filters - Optional filters (tag, status, userId, isArchived)
     */
    fetchPosts: async (filters = {}) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await POSTS_API.getPosts(filters);
            const formattedPosts = response.data.data.map(formatBackendPost);
            
            set({ 
                posts: formattedPosts,
                isLoading: false 
            });
            
            return formattedPosts;
        } catch (error) {
            console.error('Error fetching posts:', error);
            set({ 
                error: error.response?.data?.message || 'Failed to fetch posts',
                isLoading: false 
            });
            throw error;
        }
    },

    /**
     * Fetch current user's posts
     */
    fetchMyPosts: async (filters = {}) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await POSTS_API.getMyPosts(filters);
            const formattedPosts = response.data.data.map(formatBackendPost);
            
            set({ 
                posts: formattedPosts,
                isLoading: false 
            });
            
            return formattedPosts;
        } catch (error) {
            console.error('Error fetching my posts:', error);
            set({ 
                error: error.response?.data?.message || 'Failed to fetch your posts',
                isLoading: false 
            });
            throw error;
        }
    },

    // Posts section - Updated for backend integration
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

    hidePost: async (postId) => {
        try {
            await POSTS_API.archivePost(postId);
            
            // Update local state
            set(state => ({
                posts: state.posts.map(post => 
                    post.id === postId ? { ...post, isArchived: true } : post
                )
            }));
            
            return true;
        } catch (error) {
            console.error('Error hiding post:', error);
            set({ error: error.response?.data?.message || 'Failed to hide post' });
            throw error;
        }
    },

    unhidePost: async (postId) => {
        try {
            await POSTS_API.unarchivePost(postId);
            
            // Update local state
            set(state => ({
                posts: state.posts.map(post => 
                    post.id === postId ? { ...post, isArchived: false } : post
                )
            }));
            
            return true;
        } catch (error) {
            console.error('Error unhiding post:', error);
            set({ error: error.response?.data?.message || 'Failed to unhide post' });
            throw error;
        }
    },

    deletePost: async (postId) => {
        try {
            await POSTS_API.deletePost(postId);
            
            // Remove from local state
            set(state => ({
                posts: state.posts.filter(post => post.id !== postId)
            }));
            
            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
            set({ error: error.response?.data?.message || 'Failed to delete post' });
            throw error;
        }
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
                },
                // Store actual File objects for upload
                actualFiles: [...state.actualFiles, ...files]
            }));
        } else if (type === 'file') {
            const fileNames = files.map(getFileName);
            set(state => ({
                formData: {
                    ...state.formData,
                    selectedFiles: [...state.formData.selectedFiles, ...fileNames]
                },
                // Store actual File objects for upload
                actualFiles: [...state.actualFiles, ...files]
            }));
        }
    },

    removeImage: (imageUrl) => {
        set(state => {
            const imageIndex = state.formData.selectedImages.indexOf(imageUrl);
            if (imageIndex !== -1) {
                // Remove the corresponding file from actualFiles
                const newActualFiles = [...state.actualFiles];
                newActualFiles.splice(imageIndex, 1);
                
                return {
                    formData: {
                        ...state.formData,
                        selectedImages: state.formData.selectedImages.filter(img => img !== imageUrl)
                    },
                    actualFiles: newActualFiles
                };
            }
            return state;
        });
    },

    removeFile: (fileName) => {
        set(state => {
            const fileIndex = state.formData.selectedFiles.indexOf(fileName);
            if (fileIndex !== -1) {
                // Remove the corresponding file from actualFiles
                const newActualFiles = [...state.actualFiles];
                const imageCount = state.formData.selectedImages.length;
                newActualFiles.splice(imageCount + fileIndex, 1);
                
                return {
                    formData: {
                        ...state.formData,
                        selectedFiles: state.formData.selectedFiles.filter(file => file !== fileName)
                    },
                    actualFiles: newActualFiles
                };
            }
            return state;
        });
    },

    // Remove existing file (mark for deletion)
    removeExistingFile: (fileId) => {
        set(state => ({
            existingFiles: state.existingFiles.filter(file => file.id !== fileId),
            filesToDelete: [...state.filesToDelete, fileId]
        }));
    },

    // Get all existing images
    getExistingImages: () => {
        const { existingFiles } = get();
        return existingFiles.filter(file => file.fileType?.startsWith('image/'));
    },

    // Get all existing documents
    getExistingDocuments: () => {
        const { existingFiles } = get();
        return existingFiles.filter(file => !file.fileType?.startsWith('image/'));
    },

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
                editingPostId: postData.id,
                // Clear new file selections when editing
                selectedImages: [],
                selectedFiles: []
            },
            existingFiles: postData.files || [],
            filesToDelete: [],
            actualFiles: []
        }));
    },

    resetForm: () => set(() => ({
        formData: { ...defaultFormData },
        actualFiles: [],
        existingFiles: [],
        filesToDelete: [],
        error: null // Clear any errors when resetting
    })),

    clearError: () => set({ error: null }),

    /**
     * Creates and submits a new post to the backend
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
            set({ error: validation.error });
            return false;
        }

        set(state => ({
            formData: { ...state.formData, isSubmitting: true },
            error: null
        }));

        try {
            const { formData, actualFiles } = get();

            // Create FormData for the API request
            const postFormData = formatPostData(formData, actualFiles);

            // Submit to backend
            const response = await POSTS_API.createPost(postFormData);
            const newPost = formatBackendPost(response.data.data);

            // Add to local state
            set(state => ({
                posts: [newPost, ...state.posts]
            }));

            console.log('Post created successfully:', newPost);

            get().resetForm();
            if (onSuccess) onSuccess();
            return true;

        } catch (error) {
            console.error('Error submitting post:', error);
            set({ 
                error: error.response?.data?.message || 'Failed to create post'
            });
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
            set({ error: validation.error });
            return false;
        }

        set(state => ({
            formData: { ...state.formData, isSubmitting: true },
            error: null
        }));

        try {
            const { formData, filesToDelete, actualFiles } = get();
            
            // 1. First, delete files that were marked for deletion
            for (const fileId of filesToDelete) {
                try {
                    await POSTS_API.deletePostFile(postId, fileId);
                } catch (fileDeleteError) {
                    console.error('Error deleting file:', fileDeleteError);
                    // Continue with other operations even if file deletion fails
                }
            }

            // 2. Add new files if any
            if (actualFiles.length > 0) {
                try {
                    const postFormData = new FormData();
                    actualFiles.forEach(file => {
                        postFormData.append('files', file);
                    });
                    await POSTS_API.addFilesToPost(postId, postFormData);
                } catch (fileUploadError) {
                    console.error('Error uploading new files:', fileUploadError);
                    // Continue with post update even if file upload fails
                }
            }
            
            // 3. Update post content
            const updateData = {
                title: formData.title,
                content: formData.content,
                tag: formData.tag,
                status: formData.status
            };

            // Submit to backend
            const response = await POSTS_API.updatePost(postId, updateData);
            const updatedPost = formatBackendPost(response.data.data);

            // Update local state
            set(state => ({
                posts: state.posts.map(post => 
                    post.id === postId ? updatedPost : post
                )
            }));

            console.log('Post updated:', updatedPost);

            get().resetForm();

            if (onSuccess) onSuccess();
            return true;

        } catch (error) {
            console.error('Error updating post:', error);
            set({ 
                error: error.response?.data?.message || 'Failed to update post'
            });
            return false;
        } finally {
            set(state => ({
                formData: { ...state.formData, isSubmitting: false }
            }));
        }
    },

    hasAttachments: () => {
        const { formData, existingFiles } = get();
        return formData.selectedImages.length > 0 || 
               formData.selectedFiles.length > 0 || 
               existingFiles.length > 0;
    },

    getAttachmentCount: () => {
        const { formData, existingFiles } = get();
        return formData.selectedImages.length + formData.selectedFiles.length + existingFiles.length;
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