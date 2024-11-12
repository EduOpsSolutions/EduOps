import React, { useState } from "react";
import DownloadButton from "../../components/buttons/DownloadButton";
import RequestButton from "../../components/buttons/RequestButton";
import DocRequestsModal from "../../components/modals/documents/DocumentRequestsModal";
import RequestDocumentModal from "../../components/modals/documents/RequestDocumentModal";
import RequestSentModal from "../../components/modals/documents/RequestDocumentSentModal";
import SearchField from "../../components/textFields/SearchField";

function Documents() {
  const [request_document_modal, setRequestDocumentModal] = useState(false);
  const [request_sent_modal, setRequestSentModal] = useState(false);
  const [doc_requests_modal, setDocRequestsModal] = useState(false);


  return (
    <div className="bg-white-yellow-tone h-full flex flex-col">
      <div className="m-4 ">
        <div className="flex flex-row items-end">
          {/* Header area */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
          <p className="text-3xl font-semibold ml-2">Documents</p>
          {/* See requests button */}
          <div onClick={() => setDocRequestsModal(true)}>
            {/* Change Icon to follow what's in the Figma later on */}
            <button
              type="button"
              className="flex items-center px-4 ml-20 w-4/5 h-auto bg-blue-1 text-white text-lg drop-shadow-md hover:bg-blue-800 ease-in duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-5"
              >
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
              </svg>
              <div className="flex-1 flex justify-center">
                <p className="self-center text-center">See Requests</p>
              </div>
            </button>
          </div>
        </div>

        {/* Search field */}
        {/* Note: Insert backend logic for search filter */}
        <div className="flex flex-row mt-6 ml-4 mb-5 items-center">
          <SearchField name="documents" id="documents" placeholder="Search Documents"></SearchField>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 self-center transform -translate-y-1/3 ml-4 mt-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/>
          </svg>
        </div>
        
        {/* Table */}
        <div class="relative overflow-x-auto">
          <table class="w-3/4 text-base text-left rtl:text-right text-black">
            <thead class="text-base text-black uppercase">
              <tr>
                <th scope="col" class="px-4 py-2">
                  FEE
                </th>
                <th scope="col" class="px-4 py-2">
                  NAME
                </th>
                <th scope="col" class="px-4 py-2">
                  ACTIONS
                </th>
                <th scope="col" class="px-4 py-2">
                  DESCRIPTION
                </th>
              </tr>
            </thead>
        {/* Note: Replace table body data with backend logic */}
            <tbody>
              <tr>
                <td class="px-4 py-2 text-black dark:text-white">
                  FREE
                </td>
                <td class="px-4 py-2">Transcript of Records</td>
                <td class="px-4 py-2">
                  <DownloadButton onClick={() => ""}/>
                </td>
                <td class="px-4 py-2">Free for 1st request</td>
              </tr>
              <tr>
                <td class="px-4 py-2 text-black dark:text-white">
                  FREE
                </td>
                <td class="px-4 py-2">Excuse Letter</td>
                <td class="px-4 py-2">
                  <RequestButton  onClick={() => setRequestDocumentModal(true)} />
                </td>
                <td class="px-4 py-2"></td>
              </tr>
              <tr>
                <td class="px-4 py-2 text-black dark:text-white">
                  FREE
                </td>
                <td class="px-4 py-2">Signed Examination Results</td>
                <td class="px-4 py-2">
                  <RequestButton onClick={() => setRequestDocumentModal(true)} />
                </td>
                <td class="px-4 py-2"></td>
              </tr>
              <tr>
                <td class="px-4 py-2 text-black dark:text-white">
                  FREE
                </td>
                <td class="px-4 py-2">Student Manual 2024</td>
                <td class="px-4 py-2">
                  <DownloadButton onClick={() => ""}/>
                </td>
                <td class="px-4 py-2"></td>
              </tr>
              <tr>
                <td class="px-4 py-2 text-black dark:text-white">
                  FREE
                </td>
                <td class="px-4 py-2">Courses Catalog</td>
                <td class="px-4 py-2">
                  <DownloadButton onClick={() => ""}/>
                </td>
                <td class="px-4 py-2"></td>
              </tr>
              <tr>
                <td class="px-4 py-2 text-black dark:text-white">
                  FREE
                </td>
                <td class="px-4 py-2">A1 - B2 Prospectus</td>
                <td class="px-4 py-2">
                  <DownloadButton onClick={() => ""}/>
                </td>
                <td class="px-4 py-2">Latest Version 4/16/2024</td>
              </tr>
              
            </tbody>
          </table>
        </div>

        {/* Insert backend logic to pass the document name to the modal*/}
        <RequestDocumentModal
          request_document_modal={request_document_modal}
          setRequestDocumentModal={setRequestDocumentModal}
          request_sent_modal={request_sent_modal}
          setRequestSentModal={setRequestSentModal}
        />

        <RequestSentModal
          request_sent_modal={request_sent_modal}
          setRequestSentModal={setRequestSentModal}
        />

        <DocRequestsModal
          doc_requests_modal={doc_requests_modal}
          setDocRequestsModal={setDocRequestsModal}
        />

      </div>
    </div>
  );
}

export default Documents;
