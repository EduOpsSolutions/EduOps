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
                "base": "ml-auto mr-2 inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150",
                "icon": "h-5 w-5"
            }
        },
    }  
};


function TransactionHistoryModal(props) {

    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.transaction_history_modal}
                size="7xl"
                onClose={() => props.setTransactionHistoryModal(false)}
                popup
                className="transition duration-150 ease-out"
            >
            <div className="pt-6 flex flex-col bg-white-yellow-tone rounded-lg transition duration-150 ease-out">
                <Modal.Header className="z-10 transition ease-in-out duration-300 " />
                    <p className="font-bold -mt-10 ml-6 mb-4 text-left text-2xl transition ease-in-out duration-300">
                        Transaction History
                    </p>
                    <Modal.Body>
                        {/*You can achange the height to be more dynamic pero if that is okay na then you can leave it like that*/}
                        <div class="h-[500px]"> 
                            <div className="h-[90%] border-y-dark-red-2 border-y-2 overflow-y-auto">
                                <table class="table-fixed text-base text-left rtl:text-right text-black mx-auto w-full">
                                    <thead class="text-base text-black text-center border-b-dark-red-2 border-b-2">
                                        <tr>
                                            <th scope="col" className="p-2 font-normal"> Date Paid </th>
                                            <th scope="col" className="p-2 font-normal"> Purpose </th>
                                            <th scope="col" className="p-2 font-normal"> Amount </th>
                                            <th scope="col" className="p-2 font-normal"> Payment Method </th>
                                            <th scope="col" className="p-2 font-normal"> OR/Reference # </th>
                                            <th scope="col" className="p-2 font-normal"> Remarks </th>
                                            <th scope="col" className="p-2 font-normal"> Status </th>
                                        </tr>
                                    </thead>
                                {/* Note: Replace table body data with backend logic. Use 1st tr and delete 2nd tr.*/}
                                    <tbody className="text-center">
                                        <tr>
                                            <td className="px-2 py-4"> 4/3/24 6:29:23AM </td>
                                            <td className="px-2 py-4"> Course Fee</td>
                                            <td className="px-2 py-4"> 33,000 </td>
                                            <td className="px-2 py-4 uppercase"> cash </td>
                                            <td className="px-2 py-4"> 1234567789 </td>
                                            <td className="px-2 py-4 uppercase"> cash </td>
                                            <td className="px-2 py-4 uppercase"> ok </td>
                                        </tr>
                                        <tr>
                                            <td className="px-2 py-4"> 4/3/24 6:29:23AM </td>
                                            <td className="px-2 py-4"> Books Fee</td>
                                            <td className="px-2 py-4"> 33,000 </td>
                                            <td className="px-2 py-4 uppercase"> cash </td>
                                            <td className="px-2 py-4"> 565279825 </td>
                                            <td className="px-2 py-4 uppercase"> cash </td>
                                            <td className="px-2 py-4 uppercase"> ok </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default TransactionHistoryModal;
