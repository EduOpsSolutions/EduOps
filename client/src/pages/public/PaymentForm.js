import React from "react";
import SmallButton from "../../components/buttons/SmallButton";
import UserNavbar from "../../components/navbars/UserNav";
import LabelledInputField from "../../components/textFields/LabelledInputField";
import SelectField from "../../components/textFields/SelectField";
import usePaymentStore from "../../stores/paymentStore";

function PaymentForm() {
  const {
    formData,
    loading,
    phoneError,
    feesOptions,
    updateFormField,
    handleSubmit,
  } = usePaymentStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormField(name, value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <UserNavbar role="public" />

      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-3xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl font-bold">Payment Form</h1>
            <p className="italic mt-2 font-semibold">
              Fields marked with (*) are required. Please enter the correct
              information.
            </p>
          </div>

          <form onSubmit={onSubmit}>
            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <LabelledInputField
                name="enrollment_id"
                id="enrollment_id"
                label="Enrollment ID*"
                type="text"
                required={false}
                placeholder="Enter ID"
                value={formData.enrollment_id}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <LabelledInputField
                name="first_name"
                id="first_name"
                label="First Name*"
                type="text"
                required={true}
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
              <LabelledInputField
                name="middle_name"
                id="middle_name"
                label="Middle Name"
                type="text"
                placeholder="Middle Name"
                value={formData.middle_name}
                onChange={handleInputChange}
              />

              <LabelledInputField
                name="last_name"
                id="last_name"
                label="Last Name*"
                type="text"
                required={true}
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <LabelledInputField
                name="email_address"
                id="email_address"
                label="Email Address*"
                type="email"
                required={true}
                placeholder="johndoe@gmail.com"
                value={formData.email_address}
                onChange={handleInputChange}
              />
              <div>
                <LabelledInputField
                  name="phone_number"
                  id="phone_number"
                  label="Phone Number"
                  type="tel"
                  required={false}
                  placeholder="09xxxxxxxxx"
                  minLength="11"
                  maxLength="15"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className={
                    phoneError ? "border-red-500 focus:border-red-500" : ""
                  }
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <hr className="my-6 border-dark-red" />
            <p className="mb-5 font-semibold">Payment Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <SelectField
                name="fee"
                id="fee"
                label="Type of Fee*"
                required={true}
                options={feesOptions}
                value={formData.fee}
                onChange={handleInputChange}
              />
              <LabelledInputField
                name="amount"
                id="amount"
                label="Amount (PHP)*"
                type="number"
                required={true}
                placeholder="0.00"
                min="1"
                max="100000"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <SmallButton type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Checkout"
                )}
              </SmallButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;
