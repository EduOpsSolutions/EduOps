import { Flowbite, Modal } from "flowbite-react";
import React, { useState, useRef } from 'react';
import SmallButton from "../../buttons/SmallButton";
import GrayButton from "../../buttons/GrayButton";
import PostTagButton from '../../buttons/PostTagButton';
import EmojiPicker from 'emoji-picker-react';


// To customize measurements of header 
const customModalTheme = {
    modal: {
        "root": {
            "base": "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full transition-opacity",
            "show": {
                "on": "flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80 ease-in",
                "off": "hidden ease-out"
            },
        },
        "header": {
            "base": "flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600",
            "popup": "border-b-0 p-2",
            "close": {
                "base": "hidden",
                "icon": "h-5 w-5"
            },
        },
    }  
};

function CreatePostModal(props) {
    const [tag, setTag] = useState("global");
    const [selectedImages, setselectedImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [inputStr, setInputStr] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const textAreaRef = useRef(null);

    const handleTagChange = (newTag) => {
        setTag(newTag);
        document.getElementById("post-tag").value = newTag;
    };

    const handleFileUpload = (event, type) => {
        const selectedFiles = event.target.files;

        if (type === "photo") {
            const selectedFilesArray = Array.from(selectedFiles);
            const imagesArray = selectedFilesArray.map((file) => {
                return URL.createObjectURL(file);
            });

            setselectedImages((previousImages) => previousImages.concat(imagesArray));
        } else if (type === "file") {
            const selectedFilesArray = Array.from(selectedFiles);
            const filesArray = selectedFilesArray.map((file) => file.name);

            setSelectedFiles((previousFiles) => previousFiles.concat(filesArray));
        }
    };

    const handleEmojiSelection = (emoji) => {
        if (textAreaRef.current) {
            const { selectionStart, selectionEnd } = textAreaRef.current;
            const updatedText =
                inputStr.substring(0, selectionStart) +
                emoji.emoji +
                inputStr.substring(selectionEnd);

            setInputStr(updatedText);

            setTimeout(() => {
                textAreaRef.current.setSelectionRange(
                    selectionStart + emoji.emoji.length,
                    selectionStart + emoji.emoji.length
                );
                textAreaRef.current.focus();
            }, 0);
        }
        setShowPicker(false);
    };

    const handleClickOutside = (event) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
            setShowPicker(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.create_post_modal}
                size="4xl"
                onClose={() => props.setCreatePostModal(false)}
                popup
                className="transition duration-150 ease-out"
            >
                <div className="py-5 flex flex-col border-german-red border-2 text-x bg-white rounded-lg transition duration-150 ease-out">
                    <Modal.Header className="z-10 transition ease-in-out duration-300" >
                        <button
                            className="ml-3 mr-auto inline-flex items-center rounded-lg p-1.5 text-sm text-black hover:bg-grey-1 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => props.setCreatePostModal(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                        </button>
                    </Modal.Header>
                    <p className="font-bold -mt-12 ml-6 mb-6 text-center text-3xl transition ease-in-out duration-300">
                        Create Post
                    </p>
                    <Modal.Body className="overflow-visible">
                        {/* Add action for form */}
                        <form action="">
                            <div className="h-[550px] flex flex-col mt-1"> 
                                <input 
                                    type="text" 
                                    name="new-post-title" 
                                    id="new-post-title" 
                                    placeholder="Post Title" 
                                    className="rounded-lg border-0 bg-[#F5F5F5] py-5 px-7 placeholder:text-[#575757] focus:outline-none focus:ring-0"
                                    required
                                />
                                <div className="mt-3 mb-7 rounded-lg border-0 bg-[#F5F5F5] py-6 px-7 h-full">
                                    <div className={`${ selectedImages.length > 0 ? 'h-[301px] mb-4' : 'h-[293px] mb-6'} flex flex-col`}>
                                        <textarea 
                                            name="new-post-content" 
                                            id="new-post-content" 
                                            placeholder="Write Here..." 
                                            className="bg-transparent border-0 size-full resize-none py-0 ps-0 placeholder:text-[#575757] focus:outline-none focus:ring-0"
                                            required
                                            ref={textAreaRef}
                                            value={inputStr}
                                            onChange={e => setInputStr(e.target.value)}
                                        ></textarea>
                                        <div className={`${ (selectedFiles.length > 0 || selectedImages.length > 0)? 'h-40' : 'hidden'} flex flex-row items-center gap-5 overflow-x-auto pt-2`}>
                                            {selectedImages && (
                                                selectedImages.map((image, index) => {
                                                    return (
                                                        <div key={image} className="flex-none relative size-[75px]">
                                                            <button 
                                                                type="button"
                                                                className="absolute -right-2 -top-[6px] bg-[#777777] rounded-full p-1"
                                                                onClick={() => 
                                                                    setselectedImages(selectedImages.filter((e) => e !== image))
                                                                }
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#F5F5F5" className="size-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                            <img src={image} alt="" className="h-full rounded-2xl object-cover border-[3px] border-[#777777]"/>
                                                        </div>
                                                    );
                                                })
                                            )}
                                            {selectedFiles && (
                                                selectedFiles.map((files, index) => {
                                                    return (
                                                        <div key={files} className="flex-none relative h-16 w-40 bg-[#777777] rounded-2xl">
                                                            <button 
                                                                type="button"
                                                                className="absolute -right-2 -top-[6px] bg-[#777777] rounded-full p-1 drop-shadow-[0px_2px_1px_rgba(0,0,0,.5)]"
                                                                onClick={() => 
                                                                    setSelectedFiles(selectedFiles.filter((e) => e !== files))
                                                                }
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#F5F5F5" className="size-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                            <div className="size-full flex flex-row items-center justify-center p-2 text-sm text-[#F5F5F5] font-bold select-none">
                                                                <div className="min-h-10 min-w-10 flex justify-center pt-[7px] rounded-full bg-[#333333] me-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F5F5F5" class="size-6">
                                                                        <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd" />
                                                                        <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                                                                    </svg>
                                                                </div>
                                                                <p className="whitespace-nowrap overflow-hidden text-ellipsis inline-block">{files}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center">
                                        <input type="hidden" id="post-tag" name="tag" value={tag} />
                                        <PostTagButton 
                                            tag={tag} 
                                            status="unlocked" 
                                            onClick={() => handleTagChange(tag === "global" ? "broadcast" : "global")} 
                                        />

                                        <label htmlFor="new-post-photo" className="hover:cursor-pointer mx-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#666666" className="size-9">
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
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="#666666" className="size-8">
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
                                            onClick={() => setShowPicker(val => !val)}
                                        >
                                            {showPicker && (
                                                <div ref={emojiPickerRef} className="absolute -right-3 bottom-10" onClick={(e) => e.stopPropagation()}>
                                                    <EmojiPicker pickerStyle={{ width: '100%' }} onEmojiClick={handleEmojiSelection} />
                                                </div>
                                            )}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#666666" className="size-9">
                                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center">
                                    <label htmlFor="new-post-choice" className="me-3">Send a copy</label>
                                    <select name="new-post-choice" id="new-post-choice" className="rounded-md border-black focus:outline-none focus:ring-0 focus:border-black cursor-pointer">
                                        <option value="email">Email Recipients</option>
                                        <option value="push">Push Notifications</option>
                                        <option value="both">Both</option>
                                    </select>
                                    <div className="m-0 ml-auto">
                                        {/* No backend yet for error handling */}
                                        <GrayButton onClick={() => props.setCreatePostModal(false)}>Cancel</GrayButton>
                                        <span className="mx-3"></span>
                                        {/* Change onclick function for submitting the form */}
                                        <SmallButton onClick={() => props.setCreatePostModal(false)}>Create</SmallButton>
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
