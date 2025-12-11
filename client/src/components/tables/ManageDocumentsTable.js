import React from 'react';

const formatPrivacy = (privacy) => {
  const privacyMap = {
    'public': 'Public',
    'teacher_only': 'Teacher Only',
    'student_only': 'Student Only'
  };
  return privacyMap[privacy] || privacy;
};

const formatPrice = (price) => {
  const priceMap = {
    'free': 'Free',
    'paid': 'Paid'
  };
  return priceMap[price.toLowerCase()] || price;
};

const DocumentsTable = ({
  documents,
  hasSearched,
  onDocumentClick,
  onHideDocument,
  onDeleteConfirmation
}) => {
  return (
    <div>
      {documents.length > 0 ? (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-dark-red-2">
                  <th className="py-4 px-4 font-bold text-left text-xs sm:text-sm lg:text-base w-[35%]">
                    Document Name
                  </th>
                  <th className="py-4 px-4 font-bold text-left text-xs sm:text-sm lg:text-base w-[25%]">
                    Privacy
                  </th>
                  <th className="py-4 px-4 font-bold text-left text-xs sm:text-sm lg:text-base w-[20%]">
                    Price
                  </th>
                  <th className="py-4 px-4 font-bold text-center text-xs sm:text-sm lg:text-base w-[20%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr
                    key={document.id}
                    className="border-b-2 border-[rgb(137,14,7,.49)] cursor-pointer transition-colors duration-200 hover:bg-dark-red hover:text-white"
                    onClick={() => onDocumentClick(document)}
                  >
                    <td className="py-4 px-4 text-xs sm:text-sm lg:text-base">
                      <div
                        className="truncate max-w-32 sm:max-w-40 md:max-w-48 lg:max-w-none"
                        title={document.documentName}
                      >
                        {document.documentName}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs sm:text-sm lg:text-base">
                      <div
                        className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none"
                        title={formatPrivacy(document.privacy)}
                      >
                        {formatPrivacy(document.privacy)}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs sm:text-sm lg:text-base">
                      <div className="flex flex-col">
                        {document.price === "paid" && document.amount ? (
                          <span>₱{document.amount}</span>
                        ) : (
                          <span>{formatPrice(document.price)}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onHideDocument(document.id);
                          }}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${document.isHidden
                              ? "text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500"
                              : "text-orange-700 bg-orange-100 hover:bg-orange-200 focus:ring-orange-500"
                            }`}
                          title={
                            document.isHidden
                              ? "Unhide this document"
                              : "Hide this document"
                          }
                        >
                          {document.isHidden ? (
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          )}
                          <span className="hidden sm:inline">
                            {document.isHidden ? "Unhide" : "Hide"}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConfirmation(document.id);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                          title="Delete this document"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span className="hidden sm:inline">
                            Delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-dark-red-2">
                <th className="py-4 px-4 font-bold text-left text-sm sm:text-base lg:text-lg w-[35%]">
                  Document Name
                </th>
                <th className="py-4 px-4 font-bold text-left text-sm sm:text-base lg:text-lg w-[25%]">
                  Privacy
                </th>
                <th className="py-4 px-4 font-bold text-left text-sm sm:text-base lg:text-lg w-[20%]">
                  Price
                </th>
                <th className="py-4 px-4 font-bold text-center text-sm sm:text-base lg:text-lg w-[20%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="py-10 text-center">
                  <p className="text-gray-500 text-sm sm:text-base">
                    {hasSearched
                      ? "No documents found matching your search."
                      : "Loading documents..."}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentsTable;