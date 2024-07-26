import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bg_image from "../../assets/images/GermanyBg.png";
import Left_section_image from "../../assets/images/PhpGermanFlag.jpg";
import Logo from "../../assets/images/SprachinsLogo.png";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import SecondaryButton from "../../components/buttons/SecondaryButton";
import ForgetPasswordModal from "../../components/modals/ForgetPasswordModal";
import PasswordResetModal from "../../components/modals/PasswordResetModal";

Cookies.remove();



function Login() {
  const [forget_pass_modal, setForgetPasswordModal] = useState(false);
  const [password_reset_modal, setPasswordResetModal] = useState(false);


  const navigate = useNavigate();

  //hyperlink to another page
  const navigateToForgotPassword = () => {
    navigate("/forgot-password");
  };

  const navigateToSignUp = () => {
    navigate("/signUp");
  };

  const navigateToStudent = () => {
    navigate("/student");
  };

  const removeAllCookies = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      // Remove each cookie with the necessary attributes
      Cookies.remove(cookieName, {
        secure: true,
        httpOnly: false,
        sameSite: "Strict",
      });
    });
  };

  const submitForm = async () => {
    removeAllCookies(); //flushes the old cookies to ensure fresh login
    const expiry = in30Minutes(); //expiry of token for 30 mins
    Cookies.set(
      "studentId",
      "01202412312002", //set this when sucessfully logging in. This will store student data and json web tokens to ensure secure communication between server and client
      {
        secure: true,
        httpOnly: false,
        sameSite: "Strict",
        expires: expiry,
      }
    );
    Cookies.set("token", "BSQ1361Afadfae213DQ1", {
      secure: true,
      httpOnly: false,
      sameSite: "Strict",
      expires: expiry,
    });
    navigate("/student");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  var in30Minutes = () => {
    //token expiry for 30 mins
    const date = new Date();
    date.setTime(date.getTime() + 30 * 60 * 1000);
    return date;
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {
    return () => {
      Cookies.remove();
    };
  }, []);

  // Editor's Note: Need to fix responsiveness of the page.

  return (
    // Backgroung image and overlay
    <div
      className="flex justify-center items-center bg-white-yellow-tone"
      style={{
        backgroundImage: `url(${Bg_image})`,
        backgroundSize: "135%",
        backgroundPosition: "20% 70%",
        minHeight: "100vh",
      }}
    >
      <div className="absolute inset-0 bg-white-yellow-tone opacity-75"></div>

      {/* Login Form */}
      <div className="relative flex bg-dark-red-3 w-[1200px] h-[640px] z-10 overflow-hidden shadow-login-form rounded-tr-md rounded-bl-md rounded-tl-[5rem] rounded-br-[5rem]">
        <div className="flex w-full h-full relative">
          <div className="flex-[1.3] flex items-center justify-center relative">
            {/* Left Section */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${Left_section_image})`,
                backgroundSize: "115%",
                backgroundPosition: "100% 40%",
                clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
              }}
            ></div>

            {/* Slanted Divider */}
            <div className="absolute inset-y-0 right-[4.3rem] w-0.5 bg-german-yellow transform -skew-x-12"></div>
          </div>

          {/* Right Section */}
          <div className="flex-1 flex flex-col items-center relative z-10 mt-24">
            <p className="font-semibold text-[28px] text-white font-sans">
              WELCOME TO
            </p>
            <img className="w-[60%] h-auto mt-2" src={Logo} />

            {/* Login form */}
            <form className="flex flex-col items-center w-2/3 mt-2">
              {/* Email text field */}
              <div className="relative mb-3 mt-3 w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-6 h-6 text-black"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className="border border-black pl-10 pr-4 py-1 h-10 focus:outline-none bg-white-yellow-tone w-full"
                  placeholder="User ID or Email"
                  onChange={handleEmailChange}
                />
              </div>

              {/* Password text field */}
              {/* Note: There is bug where if you click out of the textbox after typing your password,
        the password eye button thingy disappears*/}
              <div className="relative w-full bg-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-6 h-6 text-black"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="border border-black pl-10 pr-4 py-1 h-10 focus:outline-none bg-white-yellow-tone w-full"
                  placeholder="Password"
                  onChange={handlePasswordChange}
                />
              </div>

              {/* need to change hover color */}
              <div className="self-end">
                <p
                  className="mt-2 text-sm text-german-yellow hover:text-bright-red cursor-pointer underline"
                  onClick={() => setForgetPasswordModal(true)}
                >
                  Forgot password?
                </p>
              </div>

              {/* Modals */}
              {/* Note: Need to add transition effect on modals */}
          
              {/* Forget Password Modal */}
              <ForgetPasswordModal
                forget_pass_modal={forget_pass_modal}
                setForgetPasswordModal={setForgetPasswordModal}
                password_reset_modal={password_reset_modal}
                setPasswordResetModal={setPasswordResetModal}
              />

              {/* Succesfully sent email to reset password modal */}
              <PasswordResetModal
                password_reset_modal={password_reset_modal}
                setPasswordResetModal={setPasswordResetModal}
              />


              <PrimaryButton onClick={navigateToStudent}>Login</PrimaryButton>
            </form>

            {/* New Student and Enrollment Tracker Area */}
            <div className="container flex items-center justify-center mt-20">
              <div className="flex flex-col items-center justify-center w-1/3">
                <p className="text-white-yellow-tone text-sm -mb-4 font-sans">
                  New Student?
                </p>
                <SecondaryButton onClick={navigateToSignUp}>
                  Enroll Now
                </SecondaryButton>
              </div>

              <div className="flex flex-col items-center justify-center w-1/3">
                <p className="text-white-yellow-tone text-sm -mb-4 font-sans">
                  Track your enrollment?
                </p>
                <SecondaryButton>Track Here</SecondaryButton>
              </div>
            </div>

            {/* Terms and Privacy Policy Section*/}
            <div className="w-80">
              <p className="text-sm mt-2 text-white-yellow-tone text-center">
                By using this service, you understood and agree to our{" "}
                <span className="cursor-pointer text-german-yellow hover:text-bright-red underline">
                  <a onClick={navigateToSignUp}>Terms</a>
                </span>
                {" and "}
                <span className="cursor-pointer text-german-yellow hover:text-bright-red underline">
                  <a onClick={navigateToSignUp}>Privacy Policy</a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <script src="../path/to/flowbite/dist/flowbite.min.js"></script>
    </div>
  );
}

export default Login;
