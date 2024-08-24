import { Flowbite, Modal } from "flowbite-react";
import React from 'react';

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
            "title": "text-xl font-medium text-gray-900 dark:text-white text-center",
            "close": {
                "base": "ml-auto mr-2 inline-flex items-center rounded-lg p-1.5 text-sm text-black hover:bg-grey-1 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
                "icon": "h-5 w-5"
            }
        },
    }  
};

function DocRequestsModal(props) {
    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.doc_requests_modal}
                size="7xl"
                onClose={() => props.setDocRequestsModal(false)}
                popup
                className="transition duration-150 ease-out"
            >
            <div className="py-4 flex flex-col bg-white-yellow-tone rounded-lg transition duration-150 ease-out">
                <Modal.Header className="z-10 transition ease-in-out duration-300" />
                    <p className="font-bold -mt-10 mb-4 text-center text-2xl transition ease-in-out duration-300">
                        Document Requests
                    </p>
                    <Modal.Body>
                        {/*You can achange the height to be more dynamic pero if that is okay na then you can leave it like that*/}
                        <div class="h-[500px]"> 
                            <table class="text-base text-left rtl:text-right text-black mx-auto w-full">
                                <thead class="text-base text-black text-center border-b-dark-red-2 border-b-2 p-0">
                                    <tr>
                                        <th scope="col" class="px-2 py-1">
                                        Date
                                        </th>
                                        <th scope="col" class="px-2 py-1">
                                        Document
                                        </th>
                                        <th scope="col" class="px-2 py-1">
                                        Status
                                        </th>
                                        <th scope="col" class="px-2 py-1">
                                        Remarks
                                        </th>
                                    </tr>
                                </thead>
                            {/* Note: Replace table body data with backend logic with classnames of first tr and add Onclick logic*/}
                            {/* PS it should account na in case overflow probably hehe */}
                                <tbody className="text-center">
                                    <tr className="hover:bg-dark-red-2 hover:text-white cursor-pointer transition ease-in-out duration-300">
                                        <td class="px-2 py-1">4-16-24</td>
                                        <td class="px-2 py-1">Certificate of Good Moral</td>
                                        <td class="px-2 py-1">In Transit</td>
                                        <td class="px-2 py-1">ETA 3-4 days</td>
                                    </tr>
                                    <tr className="hover:bg-dark-red-2 hover:text-white cursor-pointer transition ease-in-out duration-300">
                                        <td class="px-2 py-1">4-16-24</td>
                                        <td class="px-2 py-1">Certificate of Good Moral</td>
                                        <td class="px-2 py-1">Delivered</td>
                                        <td class="px-2 py-1">Done</td>
                                    </tr>
                                    <tr className="hover:bg-dark-red-2 hover:text-white cursor-pointer transition ease-in-out duration-300">
                                        <td class="px-2 py-1">4-16-24</td>
                                        <td class="px-2 py-1">Form 138</td>
                                        <td class="px-2 py-1">Delivered</td>
                                        <td class="px-2 py-1">Done</td>
                                    </tr>
                                                    
                                </tbody>
                            </table>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default DocRequestsModal;
