import { Flowbite, Modal } from "flowbite-react";
import React, { useState } from 'react';
import SmallButton from "../../buttons/SmallButton";
import GrayButton from "../../buttons/GrayButton";
import PostTagButton from '../../buttons/PostTagButton';


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
    const [photoFileName, setPhotoFileName] = useState("");
    const [docFileName, setDocFileName] = useState("");

    const handleTagChange = (newTag) => {
        setTag(newTag);
        document.getElementById("post-tag").value = newTag;
    };

    const handleFileChange = (event, type) => {
        const file = event.target.files;
        if (type === "photo") {
            setPhotoFileName(file[0] ? file[0].name : "");
            console.log("Selected photo file:", file);
            console.log(Array.isArray(file));
        } else if (type === "file") {
            setDocFileName(file ? file.name : "");
        }
    };

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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-7">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                        </button>
                    </Modal.Header>
                    <p className="font-bold -mt-12 ml-6 mb-6 text-center text-3xl transition ease-in-out duration-300">
                        Create Post
                    </p>
                    <Modal.Body>
                        <div className="h-[500px]"> 
                            <form action="" className="flex flex-col mt-1 h-full">
                                <input 
                                    type="text" 
                                    name="new-post-title" 
                                    id="new-post-title" 
                                    placeholder="Post Title" 
                                    className="rounded-lg border-0 bg-[#F5F5F5] py-5 px-7 placeholder:text-[#575757] focus:outline-none focus:ring-0"
                                    required
                                />
                                <div className="mt-3 mb-7 rounded-lg border-0 bg-[#F5F5F5] py-6 px-7 h-full">
                                    <div className="h-[85%] bg-yellow-200 mb-[2%]">
                                        <textarea 
                                            name="new-post-content" 
                                            id="new-post-content" 
                                            placeholder="Write Here..." 
                                            className="bg-pink-200 border-0 h-[75%] w-full resize-none py-0 ps-0 placeholder:text-[#575757] focus:outline-none focus:ring-0"
                                            required
                                        ></textarea>
                                        <div className="bg-blue-200 overflow-x-auto h-[25%]">
                                            {photoFileName && (
                                                <span className="ml-2 text-sm text-gray-600">{photoFileName}</span>
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

                                        <label for="new-post-photo" className="hover:cursor-pointer mx-4">
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
                                            onChange={(e) => handleFileChange(e, "photo")}
                                        />

                                            
                                        <label for="new-post-docs" className="hover:cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#666666" className="size-8">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                            </svg>
                                        </label>
                                        <input 
                                            type="file" 
                                            name="new-post-docs" 
                                            id="new-post-docs" 
                                            accept=".doc,.docx,.pdf" 
                                            className="hidden"
                                            multiple
                                        />

                                        <button type="button" id="emoji-button" className="ml-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#666666" className="size-9">
                                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center">
                                    <label for="new-post-choice" className="me-3">Send a copy</label>
                                    <select name="new-post-choice" id="new-post-choice" className="rounded-md border-black focus:outline-none focus:ring-0 focus:border-black cursor-pointer">
                                        <option value="email">Email Recipients</option>
                                        <option value="push">Push Notifications</option>
                                        <option value="both">Both</option>
                                    </select>
                                    <div className="m-0 ml-auto">
                                        <GrayButton onClick={() => props.setCreatePostModal(false)}>Cancel</GrayButton>
                                        <span className="mx-3"></span>
                                        <SmallButton onClick={() => props.setCreatePostModal(false)}>Create</SmallButton>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default CreatePostModal;
