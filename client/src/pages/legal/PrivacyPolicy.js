import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Bg_image from '../../assets/images/Bg2.png';
import BackButton from '../../components/buttons/BackButton';

function PrivacyPolicy() {
    const location = useLocation();
    const navigate = useNavigate();

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const role = pathSegments[0]; 

    // Function to navigate to login page
    const navigateToLogin = () => {
        navigate("/");
    };

    return (
        <section className='flex items-start justify-start flex-row bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh'}}>
            
            <div className="relative max-w-full mx-auto bg-transparent w-full px-8 py-4 mt-4 mb-12 flex flex-col">
            
                {role === "legal" && (
                    <BackButton onClick={navigateToLogin} className="mr-4" />
                )}        
                
                <div className="relative max-w-full mx-auto bg-white w-11/12 px-8 py-4 flex flex-col text-justify shadow-gray-300 shadow-lg drop-shadow-lg rounded-lg">
                    <h1 className='text-center text-5xl font-semibold'>Privacy Policy</h1>

                    <h2 className='text-lg font-bold'>Privacy Policy</h2>
                    <p className='mb-4'>EduOps is committed to providing quality services to you and this policy outlines our ongoing obligations to you in respect of how we manage your Personal Information.</p>
                    <p className='mb-4'>We have adopted the National Privacy Commission (NPCs) contained in the Republic Act No. 10173.The NPCs govern the way in which we collect, use, disclose, store, secure and dispose of your Personal Information.</p>
                    <p className='mb-4'>A copy of the National Privacy Commission may be obtained from the website of National Privacy Commission at https://privacy.gov.ph/data-privacy-act/.</p>

                    <h2 className='text-lg font-bold'>What is Personal Information and why do we collect it?</h2>
                    <p className='mb-4'>Personal Information is information or an opinion that identifies an individual. Examples of Personal Information we collect includes names, addresses, email addresses, phone and facsimile numbers.</p>
                    <p className='mb-4'>This Personal Information is obtained in many ways including [interviews, correspondence, by telephone and facsimile, by email, via our website, from your website, from media and publications, from other publicly available sources, from cookies- delete all that aren’t applicable] and from third parties. We don’t guarantee website links or policy of authorised third parties.</p>
                    <p className='mb-4'>We collect your Personal Information for the primary purpose of providing our services to you, providing information to our clients and marketing. We may also use your Personal Information for secondary purposes closely related to the primary purpose, in circumstances where you would reasonably expect such use or disclosure. You may unsubscribe from our mailing/marketing lists at any time by contacting us in writing.</p>
                    <p className='mb-4'>When we collect Personal Information we will, where appropriate and where possible, explain to you why we are collecting the information and how we plan to use it.</p>

                    <h2 className='text-lg font-bold'>Sensitive Information</h2>
                    <p className='mb-4'>Sensitive information is defined in the Privacy Act to include information or opinion about such things as an individual's racial or ethnic origin, political opinions, membership of a political association, religious or philosophical beliefs, membership of a trade union or other professional body, criminal record or health information.</p>
                    <p>Sensitive information will be used by us only:</p>
                    <ul className='ps-8 space-y-1 list-disc list-inside'>
                        <li>For the primary purpose for which it was obtained</li>
                        <li>For a secondary purpose that is directly related to the primary purpose</li>
                        <li>With your consent; or where required or authorized by law.</li>
                    </ul>

                    <h2 className='text-lg font-bold mt-4'>Third Parties</h2>
                    <p className='mb-4'>Where reasonable and practicable to do so, we will collect your Personal Information only from you. However, in some circumstances we may be provided with information by third parties. In such a case we will take reasonable steps to ensure that you are made aware of the information provided to us by the third party.</p>

                    <h2 className='text-lg font-bold'>Disclosure of Personal Information</h2>
                    <p>Your Personal Information may be disclosed in a number of circumstances including the following:</p>
                    <ul className='ps-8 space-y-1 list-disc list-inside'>
                        <li>Third parties where you consent to the use or disclosure; and</li>
                        <li>Where required or authorized by law.</li>
                    </ul>

                    <h2 className='text-lg font-bold mt-4'>Security of Personal Information</h2>
                    <p className='mb-4'>Your Personal Information is stored in a manner that reasonably protects it from misuse and loss and from unauthorized access, modification or disclosure.</p>
                    <p className='mb-4'>When your Personal Information is no longer needed for the purpose for which it was obtained, we will take reasonable steps to destroy or permanently de-identify your Personal Information. However, most of the Personal Information is or will be stored in client files which will be kept by us for a minimum of 7 years.</p>

                    <h2 className='text-lg font-bold'>Access to your Personal Information</h2>
                    <p className='mb-4'>You may access the Personal Information we hold about you and to update and/or correct it, subject to certain exceptions. If you wish to access your Personal Information, please contact us in writing.</p>
                    <p className='mb-4'><span className='font-bold'>EduOps</span> will not charge any fee for your access request, but may charge an administrative fee for providing a copy of your Personal Information.</p>
                    <p className='mb-4'>In order to protect your Personal Information we may require identification from you before releasing the requested information.</p>

                    <h2 className='text-lg font-bold'>Maintaining the Quality of your Personal Information</h2>
                    <p className='mb-4'>It is an important to us that your Personal Information is up to date. We will  take reasonable steps to make sure that your Personal Information is accurate, complete and up-to-date. If you find that the information we have is not up to date or is inaccurate, please advise us as soon as practicable so we can update our records and ensure we can continue to provide quality services to you.</p>
                    
                    <h2 className='text-lg font-bold'>Policy Updates</h2>
                    <p className='mb-4'>This Policy may change from time to time and is available on our website.</p>

                    <h2 className='text-lg font-bold'>Privacy Policy Complaints and Enquiries</h2>
                    <p className='mb-4'>If you have any queries or complaints about our Privacy Policy please contact us at:</p>
                    <p>info@sprachinstitut-cebu.inc</p>
                    <p>(+63) 97239232223</p>
                    

                </div>
            </div>
        </section>
    );

}

export default PrivacyPolicy;
