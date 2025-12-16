import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDocumentValidationStore } from "../../stores/documentValidationStore";
import Spinner from "../../components/common/Spinner";
import jsQR from "jsqr";
import Logo from "../../assets/images/SprachinsLogo.png";

function GuestDocumentValidation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [signature, setSignature] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [qrUploadError, setQrUploadError] = useState("");
  const [scanningQR, setScanningQR] = useState(false);
  const fileInputRef = useRef(null);
  const qrInputRef = useRef(null);

  const {
    loading,
    error,
    documentInfo,
    comparisonResult,
    validateSignature,
    compareFileSignature,
    resetValidation,
    clearComparisonResult,
  } = useDocumentValidationStore();

  // Auto-fill and validate signature from URL parameter
  useEffect(() => {
    const signatureParam = searchParams.get("signature");
    if (signatureParam && !documentInfo) {
      setSignature(signatureParam);
      validateSignature(signatureParam);
    }
  }, [searchParams, documentInfo, validateSignature]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetValidation();
      setSignature("");
      setUploadedFile(null);
      setQrUploadError("");
    };
  }, [resetValidation]);

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrUploadError("");
    setScanningQR(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            try {
              const url = new URL(code.data);
              const signatureParam = url.searchParams.get("signature");

              if (signatureParam) {
                setSignature(signatureParam);
                validateSignature(signatureParam);
              } else {
                setQrUploadError("No signature found in QR code");
              }
            } catch (err) {
              setQrUploadError("Invalid QR code format");
            }
          } else {
            setQrUploadError("No QR code detected in the image");
          }
          setScanningQR(false);
        };
        img.onerror = () => {
          setQrUploadError("Failed to load image");
          setScanningQR(false);
        };
        img.src = event.target.result;
      };
      reader.onerror = () => {
        setQrUploadError("Failed to read file");
        setScanningQR(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setQrUploadError("Error processing QR code");
      setScanningQR(false);
    }
  };

  const handleSignatureSubmit = async (e) => {
    e.preventDefault();
    if (signature.trim()) {
      await validateSignature(signature.trim());
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && documentInfo) {
      setUploadedFile(file);
      await compareFileSignature(file, documentInfo.fileSignature);
    }
  };

  const handleUploadNewFile = () => {
    setUploadedFile(null);
    clearComparisonResult();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleValidateAnother = () => {
    setSignature("");
    setUploadedFile(null);
    setQrUploadError("");
    resetValidation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (qrInputRef.current) {
      qrInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white-yellow-tone min-h-screen box-border flex flex-col">
      {/* Header with Logo */}
      <div className="bg-dark-red-2 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
          >
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-start py-8 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full max-w-2xl bg-white border-dark-red-2 border-2 rounded-lg p-6 sm:p-8 lg:p-10 shadow-xl">
          <div className="flex items-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-dark-red-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <div className="ml-3">
              <p className="text-2xl sm:text-3xl font-semibold">
                Verify Document Authenticity
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Guest Access - No login required
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && !documentInfo && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Step 1: Enter Signature */}
          {!documentInfo && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Enter Document Signature
                </h2>
                <p className="text-gray-600 text-sm">
                  Enter the file signature to verify document authenticity
                </p>
              </div>

              <form onSubmit={handleSignatureSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Enter signature (e.g., cff2e3c)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-red-2 focus:border-transparent text-center text-lg font-mono"
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !signature.trim()}
                  className="w-full px-6 py-3 bg-dark-red-2 hover:bg-dark-red-5 text-white rounded-lg transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Validating..." : "Validate Signature"}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* QR Code Upload Section */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3">
                  Upload QR Code Image
                </h3>

                {qrUploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{qrUploadError}</p>
                  </div>
                )}

                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  disabled={loading || scanningQR}
                  className="hidden"
                  id="qr-upload"
                />

                <label
                  htmlFor="qr-upload"
                  className={`inline-flex flex-col items-center justify-center w-full max-w-xs mx-auto p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    scanningQR || loading
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : "border-gray-400 hover:border-dark-red-2 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    {scanningQR ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-red-2 mb-3"></div>
                        <p className="text-sm text-gray-600">
                          Scanning QR Code...
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12 text-gray-400 mb-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                          />
                        </svg>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload QR code
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-3">
                  Upload a screenshot or photo of the document's QR code to
                  automatically validate
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Display Document Info and Upload File */}
          {documentInfo && !comparisonResult && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-3">
                      Valid Signature Found
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Document Signature:{" "}
                        </span>
                        <span className="font-mono text-gray-900">
                          {documentInfo.fileSignature}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Document Name:{" "}
                        </span>
                        <span className="text-gray-900">
                          {documentInfo.documentName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-12 h-12 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">
                  Upload a file to compare signatures.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="mt-4 px-6 py-2 bg-dark-red-2 hover:bg-dark-red-5 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Comparing..." : "Choose File"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Display Comparison Result */}
          {comparisonResult && (
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Document Signature:{" "}
                    </span>
                    <span className="font-mono text-gray-900">
                      {documentInfo.fileSignature}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Document Name:{" "}
                    </span>
                    <span className="text-gray-900 break-all">
                      {documentInfo.documentName}
                    </span>
                  </div>
                </div>
              </div>

              {comparisonResult.isMatch ? (
                // Signatures Match
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-lg font-medium mb-1 break-all">
                    {uploadedFile?.name || "uploadedfile.pdf"}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-green-900 text-xl font-bold">
                      ✓ Signatures Match!
                    </p>
                    <p className="text-green-700 text-sm mt-2">
                      This document is authentic and verified.
                    </p>
                  </div>
                  <button
                    onClick={handleValidateAnother}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-2 text-dark-red-2 border-2 border-dark-red-2 hover:bg-dark-red-2 hover:text-white rounded-lg transition-colors font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    Validate Another Document
                  </button>
                </div>
              ) : (
                // Signatures Don't Match
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-lg font-medium mb-1 break-all">
                    {uploadedFile?.name || "uploadedfile.pdf"}
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-900 text-xl font-bold mb-2">
                      ✗ File signatures does not match!
                    </p>
                    <p className="text-red-700 text-sm break-all">
                      Uploaded file signature:{" "}
                      {comparisonResult.uploadedSignature}
                    </p>
                    <p className="text-red-600 text-xs mt-2">
                      This document may not be authentic.
                    </p>
                  </div>
                  <button
                    onClick={handleUploadNewFile}
                    className="mt-6 px-8 py-3 bg-dark-red-2 hover:bg-dark-red-5 text-white rounded-lg transition-colors font-medium shadow-lg"
                  >
                    Upload New File
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center py-8">
              <Spinner size="large" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GuestDocumentValidation;
