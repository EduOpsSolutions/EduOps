import React from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "flowbite-react";
import logo from "../../assets/images/SprachinsLogo.png";

function AdminNavbar() {
    return (
        <nav className="w-full h-20 flex flex-row justify-center items-center bg-german-red text-white px-8 py-2 border-b-[5px] border-dark-red-2 z-10 select-none">
            <Link to="/admin" className="">
                <img src={logo} alt="" className="h-16 w-auto" />
            </Link>
            <div className="flex w-full justify-center items-center font-bold text-lg">
                <Link to="/admin" className="me-6 hover:text-dark-red-4"> Home </Link>
                {/* <Link to="/admin" className="me-6 hover:text-dark-red-4"> Tasks </Link> */}
                <Dropdown 
                    label="" 
                    className="w-fit font-semibold rounded-none bg-dark-red border-black mt-1"
                    dismissOnClick={true} 
                    trigger="hover"
                    renderTrigger={() => <span className="cursor-pointer me-6 hover:text-dark-red-4"> Enrollment </span>}
                >
                    <div class="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-red border-t border-l border-black rotate-45"></div>
                    {/* <Dropdown.Item as={Link} to="/admin/enrollment/schedule" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Student Admission
                    </Dropdown.Item> */}
                    <Dropdown.Item as={Link} to="/admin/enrollment/schedule" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Schedule
                    </Dropdown.Item>
                    {/* <Dropdown.Item as={Link} to="/admin/enrollment/schedule" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Study Load
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin/enrollment/schedule" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Teaching Load
                    </Dropdown.Item> */}
                    <Dropdown.Item  as={Link} to="/admin/CourseManagement" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Course Assignment
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Enrollment Period
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Enrollment Request
                    </Dropdown.Item>
                </Dropdown>
                <Link to="/admin/grades" className="me-6 hover:text-dark-red-4"> Grades </Link>
                <Dropdown 
                    label="" 
                    className="w-fit font-semibold rounded-none bg-dark-red border-black mt-1"
                    dismissOnClick={true} 
                    trigger="hover"
                    renderTrigger={() => <span className="cursor-pointer me-6 hover:text-dark-red-4"> Payment </span>}
                >
                    <div class="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-red border-t border-l border-black rotate-45"></div>
                    <Dropdown.Item as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Assessment
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Ledger
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Manage Fees
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Manage Transactions
                    </Dropdown.Item>
                </Dropdown>
                <Dropdown 
                    label="" 
                    className="w-fit font-semibold rounded-none bg-dark-red border-black mt-1"
                    dismissOnClick={true} 
                    trigger="hover"
                    renderTrigger={() => <span className="cursor-pointer me-6 hover:text-dark-red-4"> Documents </span>}
                >
                    <div class="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-red border-t border-l border-black rotate-45"></div>
                    <Dropdown.Item as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Manage Documents
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Document Requests
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Reports
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
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
                    <Dropdown.Item as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        View Student Accounts
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        View Teacher Accounts
                    </Dropdown.Item>
                    <Dropdown.Item  as={Link} to="/admin/" className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4">
                        Create User
                    </Dropdown.Item>
                </Dropdown>
            </div>
            <div className="h-[48px] w-[48px] flex justify-center items-center font-bold text-xl border-2 rounded-full cursor-pointer">
                PD
            </div>
        </nav>
    );
}

export default AdminNavbar;
