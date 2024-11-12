import React from "react";

function forgetPasswordModal() {
  return (
    <div className="modal-container">
      <div
        id="overlay-2"
        class="hidden fixed size-full bg-modal-overlay transition-all ease-in duration-300 opacity-0"
        onclick="closeModal('forget-password-modal', 'overlay-2')"
      ></div>
      <div
        id="forget-password-modal"
        class="hidden fixed min-h-48 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 p-6 bg-white-yellow items-center justify-center flex-col transition-all ease-in duration-300 opacity-0"
      >
        <h1 class="text-modal-head font-bold">Forgot Password?</h1>
        <p class="text-center mt-2">
          Please provide the email that you used when you signed up for your
          account
        </p>

        <form class="flex flex-col mb-0">
          <div>
            <p class="mt-5">Email Address</p>
            <input
              type="text"
              name="email"
              class="border border-black pl-2 mb-3 mt-1 py-1 h-10 focus:outline-none w-full"
            ></input>
          </div>
          <p class="text-xs text-center">
            We will send you an email that will allow you to reset your
            password.
          </p>
          <a href="reset-pass.html" class="self-center">
            <button
              class="mt-5 w-36 h-10 self-center size-8 font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150"
              type="button"
            >
              Reset Password
            </button>
          </a>
        </form>
      </div>
    </div>
  );
}

export default forgetPasswordModal;
