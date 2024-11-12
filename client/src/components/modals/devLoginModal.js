import React from "react";

function devLoginModal() {
  return (
    <div className="modal-container">
      <div
        id="overlay-1"
        className="hidden fixed size-full bg-modal-overlay transition-opacity ease-in duration-300 opacity-0"
        onclick="closeModal('dev-login-modal', 'overlay-1')"
      ></div>
      <div
        id="dev-login-modal"
        className="hidden fixed min-h-52 min-w-1/3 p-6 bg-white-yellow items-center justify-center flex-col transition-opacity ease-in duration-300 opacity-0"
      >
        <h1 className="text-modal-head font-bold">Development Mode</h1>
        <p>Select role to login</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="student/home.html">
            <button className="mt-5 w-36 h-10 self-center size-8 font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150">
              Student
            </button>
          </a>
          <a href="teacher/home.html">
            <button className="mt-5 w-36 h-10 self-center size-8 font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150">
              Teacher
            </button>
          </a>
          <a href="admin/home.html">
            <button className="mt-5 w-36 h-10 self-center size-8 font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150">
              Admin
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default devLoginModal;
