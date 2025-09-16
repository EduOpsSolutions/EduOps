import { Flowbite, Modal } from "flowbite-react";
import React, { useRef } from 'react';
import PostTagButton from '../../buttons/PostTagButton';
import EmojiPicker from 'emoji-picker-react';
import usePostsStore from '../../../stores/postsStore';

const MODAL_THEME = {
    modal: {
        "root": {
            "base": "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full transition-opacity",
            "show": {
                "on": "flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80 ease-in",
                "off": "hidden ease-out"
            },
        },
        "header": {
            "base": "flex items-start justify-between rounded-t border-b p-3 sm:p-5 dark:border-gray-600",
            "popup": "border-b-0 p-2",
            "close": {
                "base": "hidden",
                "icon": "h-5 w-5"
            },
        },
    }  
};

const FORM_CONFIG = {
    heights: {
        container: "flex flex-col",
        textareaWithAttachments: "h-[160px] sm:h-[180px] lg:h-[200px] mb-3 sm:mb-4",
        textareaWithoutAttachments: "h-[180px] sm:h-[200px] lg:h-[220px] mb-3 sm:mb-4",
        attachmentsContainer: "h-24 sm:h-28 lg:h-32"
    },
    styles: {
        input: "rounded-lg border-0 bg-[#F5F5F5] py-2.5 sm:py-3 px-4 sm:px-5 text-sm sm:text-base placeholder:text-[#575757] focus:outline-none focus:ring-0",
        textarea: "bg-transparent border-0 size-full resize-none py-0 ps-0 text-sm sm:text-base placeholder:text-[#575757] focus:outline-none focus:ring-0",
        contentContainer: "mt-2 sm:mt-3 mb-1 sm:mb-2 rounded-lg border-0 bg-[#F5F5F5] py-3 sm:py-4 px-4 sm:px-5"
    }
};

const SEND_OPTIONS = [
    { value: "email", label: "Email Recipients" },
    { value: "push", label: "Push Notifications" },
    { value: "both", label: "Both" }
];

const getTextareaHeight = (hasAttachments) => 
    hasAttachments ? FORM_CONFIG.heights.textareaWithAttachments : FORM_CONFIG.heights.textareaWithoutAttachments;

const CloseButton = ({ onClick }) => (
    <button
        className="ml-2 sm:ml-3 mr-auto inline-flex items-center rounded-lg p-1.5 text-sm text-black hover:bg-grey-1 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
        onClick={onClick}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
    </button>
);

const ImagePreview = ({ src, onRemove }) => (
    <div className="flex-none relative w-16 h-16 sm:w-[70px] sm:h-[70px] lg:w-[75px] lg:h-[75px]">
        <button 
            type="button"
            className="absolute -right-1 sm:-right-2 -top-1 sm:-top-[6px] bg-[#777777] rounded-full p-0.5 sm:p-1"
            onClick={onRemove}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#F5F5F5" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </button>
        <img src={src} alt="" className="h-full w-full rounded-xl sm:rounded-2xl object-cover border-2 sm:border-[3px] border-[#777777]"/>
    </div>
);

const FilePreview = ({ fileName, onRemove }) => (
    <div className="flex-none relative h-12 sm:h-14 lg:h-16 w-32 sm:w-36 lg:w-40 bg-[#777777] rounded-xl sm:rounded-2xl">
        <button 
            type="button"
            className="absolute -right-1 sm:-right-2 -top-1 sm:-top-[6px] bg-[#777777] rounded-full p-0.5 sm:p-1 drop-shadow-[0px_2px_1px_rgba(0,0,0,.5)]"
            onClick={onRemove}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#F5F5F5" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </button>
        <div className="size-full flex flex-row items-center justify-center p-1.5 sm:p-2 text-xs sm:text-sm text-[#F5F5F5] font-bold select-none">
            <div className="min-h-8 min-w-8 sm:min-h-9 sm:min-w-9 lg:min-h-10 lg:min-w-10 flex justify-center pt-1.5 sm:pt-2 lg:pt-[7px] rounded-full bg-[#333333] me-1.5 sm:me-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F5F5F5" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                </svg>
            </div>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis inline-block">{fileName}</p>
        </div>
    </div>
);

const ActionButtons = ({ emojiPickerRef, textAreaRef }) => {
    const {
        formData,
        toggleTag,
        toggleEmojiPicker,
        insertEmoji,
        addFiles
    } = usePostsStore();

    const handleFileUpload = (event, type) => {
        const files = Array.from(event.target.files);
        addFiles(files, type);
    };

    return (
        <div className="flex flex-row items-center gap-2 sm:gap-0">
            <PostTagButton 
                tag={formData.tag} 
                status="unlocked" 
                onClick={toggleTag} 
            />

            <label htmlFor="new-post-photo" className="hover:cursor-pointer mx-2 sm:mx-3 lg:mx-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#666666" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                </svg>
            </label>
            <input 
                type="file" 
                name="new-post-photo" 
                id="new-post-photo" 
                accept="image/png, image/jpeg" 
                className="hidden" 
                multiple
                onChange={(e) => handleFileUpload(e, "photo")}
            />

            <label htmlFor="new-post-docs" className="hover:cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="#666666" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
            </label>
            <input 
                type="file" 
                name="new-post-docs" 
                id="new-post-docs" 
                accept=".doc,.docx,.pdf" 
                className="hidden"
                multiple
                onChange={(e) => handleFileUpload(e, "file")}
            />

            <button 
                type="button" 
                className="relative ml-auto"
                onClick={toggleEmojiPicker}
            >
                {formData.showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute -right-2 sm:-right-3 bottom-8 sm:bottom-10 z-50" onClick={(e) => e.stopPropagation()}>
                        <div className="scale-75 sm:scale-90 lg:scale-100 origin-bottom-right">
                            <EmojiPicker 
                                pickerStyle={{ 
                                    width: '280px',
                                    '--epr-emoji-size': '24px',
                                    '--epr-category-label-height': '28px'
                                }} 
                                onEmojiClick={(emoji) => insertEmoji(emoji, textAreaRef)} 
                            />
                        </div>
                    </div>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#666666" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

function CreatePostModal(props) {
    const textAreaRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const {
        formData,
        setTitle,
        setContent,
        setSendOption,
        removeImage,
        removeFile,
        closeEmojiPicker,
        submitPost,
        resetForm,
        hasAttachments,
        fetchPosts,
        error,
        clearError
    } = usePostsStore();

    const { sendOption, isSubmitting } = formData;

    // Clear any existing errors when modal opens
    React.useEffect(() => {
        if (props.create_post_modal) {
            clearError();
        }
    }, [props.create_post_modal, clearError]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                closeEmojiPicker();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeEmojiPicker]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const success = await submitPost(() => {
            props.setCreatePostModal(false);
            // Refresh posts list after successful creation
            fetchPosts();
        });
        
        if (!success) {
            // Error is already handled in the store and displayed in the form
            console.log('Post creation failed');
        }
    };

    const handleClose = () => {
        resetForm();
        props.setCreatePostModal(false);
    };

    const attachmentsExist = hasAttachments();

    return (
        <Flowbite theme={{ theme: MODAL_THEME }}>
            <Modal
                dismissible
                show={props.create_post_modal}
                size="3xl"
                onClose={handleClose}
                popup
                className="transition duration-150 ease-out px-2 sm:px-4"
            >
                <div className="py-3 sm:py-4 flex flex-col border-german-red border-2 bg-white rounded-lg transition duration-150 ease-out w-full max-w-4xl mx-auto">
                    <Modal.Header className="z-10 transition ease-in-out duration-300">
                        <CloseButton onClick={handleClose} />
                    </Modal.Header>
                    
                    <p className="font-bold -mt-9 sm:-mt-10 ml-4 sm:ml-6 mb-3 sm:mb-4 text-center text-xl sm:text-2xl lg:text-3xl transition ease-in-out duration-300">
                        Create Post
                    </p>
                    
                    {error && (
                        <div className="mx-4 sm:mx-6 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    <Modal.Body className="overflow-visible px-3 sm:px-5 pt-0">
                        <form onSubmit={handleSubmit}>
                            <div className={`${FORM_CONFIG.heights.container} flex flex-col`}> 
                                <input 
                                    type="text" 
                                    name="new-post-title" 
                                    id="new-post-title" 
                                    placeholder="Post Title" 
                                    className={FORM_CONFIG.styles.input}
                                    value={formData.title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                
                                <div className={FORM_CONFIG.styles.contentContainer}>
                                    <div className={`${getTextareaHeight(attachmentsExist)} flex flex-col`}>
                                        <textarea 
                                            name="new-post-content" 
                                            id="new-post-content" 
                                            placeholder="Write Here..." 
                                            className={FORM_CONFIG.styles.textarea}
                                            required
                                            ref={textAreaRef}
                                            value={formData.content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                        
                                        {attachmentsExist && (
                                            <div className={`${FORM_CONFIG.heights.attachmentsContainer} flex flex-row items-center gap-3 sm:gap-4 lg:gap-5 overflow-x-auto pt-2`}>
                                                {formData.selectedImages.map((image, index) => (
                                                    <ImagePreview 
                                                        key={image} 
                                                        src={image} 
                                                        onRemove={() => removeImage(image)} 
                                                    />
                                                ))}
                                                {formData.selectedFiles.map((fileName, index) => (
                                                    <FilePreview 
                                                        key={`${fileName}-${index}`} 
                                                        fileName={fileName} 
                                                        onRemove={() => removeFile(fileName)} 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <ActionButtons
                                        emojiPickerRef={emojiPickerRef}
                                        textAreaRef={textAreaRef}
                                    />
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-1">
                                    <div className="flex items-center justify-start">
                                        <label htmlFor="new-post-choice" className="me-2 text-sm sm:text-base font-medium whitespace-nowrap">Send a copy</label>
                                        <select 
                                            name="new-post-choice" 
                                            id="new-post-choice" 
                                            className="rounded-md border-black text-sm sm:text-base focus:outline-none focus:ring-0 focus:border-black cursor-pointer px-2 py-1 bg-white"
                                            value={sendOption}
                                            onChange={(e) => setSendOption(e.target.value)}
                                        >
                                            {SEND_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            disabled={isSubmitting}
                                            className="flex-1 sm:flex-none bg-grey-1 hover:bg-grey-2 focus:outline-none text-black font-semibold rounded-md text-sm px-5 py-2 sm:px-6 sm:py-2.5 text-center shadow-sm shadow-black ease-in duration-150 min-w-[100px] disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="flex-1 sm:flex-none text-white bg-dark-red-2 hover:bg-dark-red-5 focus:outline-none font-semibold rounded-md text-sm px-5 py-2 sm:px-6 sm:py-2.5 text-center shadow-sm shadow-black ease-in duration-150 min-w-[100px] disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Creating...' : 'Create'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default CreatePostModal;