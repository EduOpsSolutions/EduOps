import { create } from 'zustand';
import Config from '../utils/config.js';

const createImagePreview = (file) => URL.createObjectURL(file);
const getFileName = (file) => file.name;

const useCreatePostStore = create((set, get) => ({
    title: '',
    content: '',
    tag: 'global',
    sendOption: 'email',

    selectedImages: [],
    selectedFiles: [],

    showEmojiPicker: false,
    isSubmitting: false,

    setTitle: (title) => set({ title }),
    setContent: (content) => set({ content }),
    setTag: (tag) => set({ tag }),
    setSendOption: (option) => set({ sendOption: option }),
    toggleTag: () => set((state) => ({
        tag: state.tag === 'global' ? 'broadcast' : 'global'
    })),

    addFiles: (files, type) => {
        if (type === 'photo') {
            const imageUrls = files.map(createImagePreview);
            set((state) => ({
                selectedImages: [...state.selectedImages, ...imageUrls]
            }));
        } else if (type === 'file') {
            const fileNames = files.map(getFileName);
            set((state) => ({
                selectedFiles: [...state.selectedFiles, ...fileNames]
            }));
        }
    },

    removeImage: (imageUrl) => set((state) => ({
        selectedImages: state.selectedImages.filter(img => img !== imageUrl)
    })),

    removeFile: (fileName) => set((state) => ({
        selectedFiles: state.selectedFiles.filter(file => file !== fileName)
    })),

    toggleEmojiPicker: () => set((state) => ({
        showEmojiPicker: !state.showEmojiPicker
    })),

    closeEmojiPicker: () => set({ showEmojiPicker: false }),

    insertEmoji: (emoji, textAreaRef) => {
        const { content } = get();

        if (textAreaRef.current) {
            const { selectionStart, selectionEnd } = textAreaRef.current;
            const updatedContent = content.substring(0, selectionStart) +
                emoji.emoji +
                content.substring(selectionEnd);

            set({ content: updatedContent, showEmojiPicker: false });

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
        const { title, content, selectedImages, selectedFiles } = get();

        if (!title.trim() || !content.trim()) {
            return { isValid: false, error: 'Title and content are required' };
        }

        const totalAttachments = selectedImages.length + selectedFiles.length;
        if (totalAttachments > Config.MAX_ATTACHMENTS) {
            return {
                isValid: false,
                error: `You can't upload more than ${Config.MAX_ATTACHMENTS} attachments.`
            };
        }

        return { isValid: true, error: null };
    },

    // Form submission
    submitPost: async (onSuccess) => {
        const validation = get().validateForm();

        if (!validation.isValid) {
            console.log(validation.error);
            return false;
        }

        set({ isSubmitting: true });

        try {
            const { title, content, tag, sendOption, selectedImages, selectedFiles } = get();

            const postData = {
                title,
                content,
                tag,
                sendOption,
                images: selectedImages,
                files: selectedFiles
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Post submitted:', postData);

            get().resetForm();

            if (onSuccess) onSuccess();
            return true;

        } catch (error) {
            console.error('Error submitting post:', error);
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },

    resetForm: () => set({
        title: '',
        content: '',
        tag: 'global',
        sendOption: 'email',
        selectedImages: [],
        selectedFiles: [],
        showEmojiPicker: false,
        isSubmitting: false
    }),

    hasAttachments: () => {
        const { selectedImages, selectedFiles } = get();
        return selectedImages.length > 0 || selectedFiles.length > 0;
    },

    getAttachmentCount: () => {
        const { selectedImages, selectedFiles } = get();
        return selectedImages.length + selectedFiles.length;
    }
}));

export default useCreatePostStore; 