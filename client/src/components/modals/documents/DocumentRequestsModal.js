import { Flowbite, Modal } from "flowbite-react";
import React, { useEffect } from 'react';
import { useDocumentRequestStore, useDocumentRequestSearchStore } from "../../../stores/documentRequestStore";
import Spinner from "../../common/Spinner";

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
    const { fetchDocumentRequests, loading, error, viewRequestDetails } = useDocumentRequestStore();
    const searchStore = useDocumentRequestSearchStore();

    useEffect(() => {
        if (props.doc_requests_modal) {
            fetchDocumentRequests();
        }
    }, [props.doc_requests_modal, fetchDocumentRequests]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        });
    };

    const getStatusStyle = (status) => {
        const styles = {
            'in_process': 'text-yellow-700 bg-yellow-100',
            'approved': 'text-blue-700 bg-blue-100',
            'ready_for_pickup': 'text-green-700 bg-green-100',
            'delivered': 'text-purple-700 bg-purple-100',
            'rejected': 'text-red-700 bg-red-100'
        };
        return styles[status] || 'text-gray-700 bg-gray-100';
    };

    const formatStatus = (status) => {
        const statusMap = {
            'in_process': 'In Process',
            'approved': 'Approved',
            'ready_for_pickup': 'Ready for Pickup',
            'delivered': 'Delivered',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status;
    };

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
                        <div className="h-[500px] overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Spinner size="large" />
                                </div>
                            ) : error ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="text-center">
                                        <p className="text-red-600 mb-4">{error}</p>
                                        <button
                                            onClick={fetchDocumentRequests}
                                            className="px-4 py-2 bg-dark-red-2 text-white rounded-md hover:bg-dark-red-5 transition-colors"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <table className="text-base text-left rtl:text-right text-black mx-auto w-full">
                                    <thead className="text-base text-black text-center border-b-dark-red-2 border-b-2 p-0">
                                        <tr>
                                            <th scope="col" className="px-2 py-3">
                                                Date
                                            </th>
                                            <th scope="col" className="px-2 py-3">
                                                Document
                                            </th>
                                            <th scope="col" className="px-2 py-3">
                                                Status
                                            </th>
                                            <th scope="col" className="px-2 py-3">
                                                Remarks
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center">
                                        {searchStore.data && searchStore.data.length > 0 ? (
                                            searchStore.data.map((request) => (
                                                <tr 
                                                    key={request.id}
                                                    className="hover:bg-dark-red-2 hover:text-white cursor-pointer transition ease-in-out duration-300"
                                                    onClick={() => {
                                                        viewRequestDetails(request);
                                                        props.setDocRequestsModal(false);
                                                    }}
                                                >
                                                    <td className="px-2 py-3">
                                                        {formatDate(request.createdAt)}
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        {request.document?.documentName || 'Unknown Document'}
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusStyle(request.status)}`}>
                                                            {formatStatus(request.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        {request.remarks || 'No remarks'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-2 py-8 text-center text-gray-500">
                                                    No document requests found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default DocRequestsModal;
