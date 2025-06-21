import { Dropdown } from "flowbite-react";
import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/SprachinsLogo.png";
// Delete this logo import after backend is implemented; used in notifications
import John_logo from '../../assets/images/John.jpg';


function UserNavbar({ role }) {
    // Only returns this navbar if user not logged in
    if (role === "public") {
        return (
            <nav className="w-full h-20 flex flex-row justify-center items-center bg-german-red text-white px-8 py-2 border-b-[5px] border-dark-red-2 z-10 select-none">
                <div className="flex flex-wrap items-center justify-between mx-auto p-2 ml-4">
                    <a href="/" className="flex">
                        <img src={logo} className="h-14 w-auto" alt="Logo" />
                    </a>
                </div>
            </nav>
        );
    }

    return (
        <nav className="w-full h-20 flex flex-row justify-center items-center bg-german-red text-white px-8 py-2 border-b-[5px] border-dark-red-2 z-10 select-none">
            <Link to={`/${role}`} className="">
                <img src={logo} alt="" className="h-16 w-auto" />
            </Link>
            <div className="flex w-full justify-center items-center font-bold text-lg">
                <Link to={`/${role}`} className="me-6 hover:text-dark-red-4"> Home </Link>
                
                <Dropdown 
                    label="" 
                    className="w-fit font-semibold rounded-none bg-dark-red border-black mt-1"
                    dismissOnClick={true} 
                    trigger="hover"
                    renderTrigger={() => 
                        <span className="cursor-pointer me-6 hover:text-dark-red-4"> 
                            {role === 'teacher' ? 'Tasks' : 'Enrollment'} 
                        </span>
                }>
                    <div class="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-red border-t border-l border-black rotate-45"></div>
                    
                    { role === 'student' && (
                        <Dropdown.Item as={Link} to={`/${role}/`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                            Student Admission
                        </Dropdown.Item>
                    )}
                    
                    <Dropdown.Item as={Link} to={`/${role}/schedule`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Schedule
                    </Dropdown.Item>
                    
                    { role === 'student' && (
                        <Dropdown.Item as={Link} to={`/${role}/studyLoad`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                            Study Load
                        </Dropdown.Item>
                    )}
                    
                    { role === 'teacher' && (
                        <Dropdown.Item as={Link} to={`/${role}/teachingLoad`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                            Teaching Load
                        </Dropdown.Item>
                    )}
                    
                    { role === 'admin' && (
                        <>
                            <Dropdown.Item  as={Link} to={`/${role}/coursemanagement`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                Course Assignment
                            </Dropdown.Item>
                            <Dropdown.Item  as={Link} to={`/${role}/enrollmentperiod`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                Enrollment Period
                            </Dropdown.Item>
                            <Dropdown.Item  as={Link} to={`/${role}/enrollmentrequests`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                Enrollment Request
                            </Dropdown.Item>
                        </>
                    )}
                </Dropdown>
                
                { ['student', 'admin'].includes(role) && ( 
                    <Link to={`/${role}/grades`} className="me-6 hover:text-dark-red-4"> Grades </Link>
                )}
                
                { ['student', 'admin'].includes(role) && ( 
                    <Dropdown 
                        label="" 
                        className="w-fit font-semibold rounded-none bg-dark-red border-black mt-1"
                        dismissOnClick={true} 
                        trigger="hover"
                        renderTrigger={() => <span className="cursor-pointer me-6 hover:text-dark-red-4"> Payment </span>}
                    >
                        <div class="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-red border-t border-l border-black rotate-45"></div>
                        <Dropdown.Item as={Link} to={`/${role}/assessment`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                            Assessment
                        </Dropdown.Item>
                        <Dropdown.Item  as={Link} to={`/${role}/ledger`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                            Ledger
                        </Dropdown.Item>
                        { role === 'admin' && (
                            <>
                                <Dropdown.Item  as={Link} to={`/${role}/managefees`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                    Manage Fees
                                </Dropdown.Item>
                                <Dropdown.Item  as={Link} to={`/${role}/transaction`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                    Manage Transactions
                                </Dropdown.Item>
                            </>
                        )}
                    </Dropdown>
                )}
                
                { ['student', 'teacher'].includes(role) && ( 
                    <Link to={`/${role}/documents`} className="me-6 hover:text-dark-red-4"> Documents </Link>
                )}
                
                { role === 'admin' && ( 
                    <>
                        <Dropdown 
                            label="" 
                            className="w-fit font-semibold rounded-none bg-dark-red border-black mt-1"
                            dismissOnClick={true} 
                            trigger="hover"
                            renderTrigger={() => <span className="cursor-pointer me-6 hover:text-dark-red-4"> Documents </span>}
                        >
                            <div class="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-red border-t border-l border-black rotate-45"></div>
                            <Dropdown.Item as={Link} to={`/${role}/`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                Manage Documents
                            </Dropdown.Item>
                            <Dropdown.Item  as={Link} to={`/${role}/`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                Document Requests
                            </Dropdown.Item>
                            <Dropdown.Item  as={Link} to={`/${role}/`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                Reports
                            </Dropdown.Item>
                            <Dropdown.Item  as={Link} to={`/${role}/`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                Document Validation
                            </Dropdown.Item>
                        </Dropdown>
                        
                        <Dropdown 
                            label="" 
                            className="w-fit font-semibold rounded-none bg-dark-red border-black mt-1"
                            dismissOnClick={true} 
                            trigger="hover"
                            renderTrigger={() => <span className="cursor-pointer me-6 hover:text-dark-red-4"> Accounts </span>}
                        >
                            <div class="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-red border-t border-l border-black rotate-45"></div>
                            <Dropdown.Item as={Link} to={`/${role}/`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                View Student Accounts
                            </Dropdown.Item>
                            <Dropdown.Item  as={Link} to={`/${role}/`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                View Teacher Accounts
                            </Dropdown.Item>
                            <Dropdown.Item  as={Link} to={`/${role}/`} className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                                Create User
                            </Dropdown.Item>
                        </Dropdown>
                    </>
                )}
            </div>
            <div className="h-full flex items-center">
                <Dropdown 
                    label="" 
                    className="w-[20%] rounded-none border-none bg-german-black"
                    dismissOnClick={true} 
                    renderTrigger={() => 
                        <span className="h-[48px] flex items-center cursor-pointer me-5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="25" height="25">
                                <path fill="white" d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"/>
                            </svg>
                        </span>
                }>
                    <div className="py-2 px-4 mb-1 text-lg font-semibold text-white flex justify-center">
                        Notifications
                    </div>
                    <Dropdown.Divider className="bg-gray-500 m-0" />
                    {/* Choose between template A or B for displaying notif messages */}
                    {/* Template A */}
                    <Dropdown.Item className="text-base text-white hover:bg-gray-700 focus:bg-gray-700">
                        <div class="shrink-0">
                            <img className="rounded-full w-11 h-11" src={John_logo} alt="" />
                        </div>
                        <div class="w-full ps-3">
                            <div class="text-left text-gray-500 text-sm mb-1.5">New message from <span class="font-semibold text-white">Jese Leos</span>: "Hey, what's up? All set for the presentation?"</div>
                            <div class="text-left text-xs text-german-yellow">a few moments ago</div>
                        </div>
                    </Dropdown.Item>
                    <Dropdown.Divider className="bg-gray-500 m-0" />
                    {/* Template B */}
                    <Dropdown.Item className="text-base text-white hover:bg-gray-700 focus:bg-gray-700">
                        <div class="w-full">
                            <div class="text-left text-gray-500 text-sm mb-1.5">New message from <span class="font-semibold text-white">Jese Leos</span>: "Hey, what's up? All set for the presentation?"</div>
                            <div class="text-left text-xs text-german-yellow">a few moments ago</div>
                        </div>
                    </Dropdown.Item>
                    {/* Delete divider and div code below if there is no view all */}
                    <Dropdown.Divider className="bg-gray-500 m-0" />
                    <div class="flex justify-center items-center text-white text-sm font-semibold py-[10px] px-4">
                        <svg class="w-4 h-4 me-2 text-gray-500 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                            <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                        </svg>
                        View all
                    </div>
                </Dropdown>
                <Dropdown 
                    label="" 
                    className="w-fit font-semibold rounded-none bg-dark-red border-none -ml-6"
                    dismissOnClick={true} 
                    trigger="hover"
                    renderTrigger={() => 
                        <span className="size-[48px] flex justify-center items-center font-bold text-xl border-2 rounded-full cursor-pointer"> 
                            PD 
                        </span>
                }>
                    <Dropdown.Item as={Link} to={`/${role}/profile`} className="text-base text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 me-3">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clip-rule="evenodd" />
                        </svg>
                        View Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/login" className="text-base text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 me-3">
                            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        </svg>
                        Logout
                    </Dropdown.Item>
                    <Dropdown.Divider className="bg-black mx-4" />
                    <Dropdown.Item className="text-xs text-white hover:bg-transparent focus:bg-transparent">
                        <Link to={`/${role}/legal/terms`} className=""> Terms </Link> 
                        <span className="mx-1"> • </span>
                        <Link to={`/${role}/legal/privacy-policy`} className=""> Privacy </Link> 
                        <span className="mx-1"> • </span>
                        <span> EduOps © 2024 </span>
                    </Dropdown.Item>
                </Dropdown>
            </div>
        </nav>
    );
}

export default UserNavbar;
