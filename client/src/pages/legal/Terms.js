import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Bg_image from '../../assets/images/Bg2.png';
import BackButton from '../../components/buttons/BackButton';

function Terms() {
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
                    <h1 className='text-center text-5xl font-semibold'>Terms & Conditions</h1>

                    <h2 className='text-lg font-bold'>1. Introduction</h2>
                    <p className='mb-4'>Our aim is to keep this Agreement as readable as possible, but in some cases for legal reasons, some of the language is required "legalese".</p>

                    <h2 className='text-lg font-bold'>2. Your Acceptance of this Agreement</h2>
                    <p className='mb-4'>These terms of service are entered into by and between You and EduOps, Inc. ("Company," "we," "our," or "us"). The following terms and conditions, together with any documents they expressly incorporate by reference (collectively "Terms of Service"), govern your access to and use of www.EduOps.com, including any content, functionality, and services offered on or through www.EduOps.com (the "Website").</p>
                    <p className='mb-4'>Please read the Terms of Service carefully before you start to use the Website.</p>
                    <p className='mb-4'>By using the Website [or by clicking to accept or agree to the Terms of Service when this option is made available to you], you accept and agree to be bound and abide by these Terms of Service and our Privacy Policy, found at /privacy-policy, incorporated herein by reference. If you do not want to agree to these Terms of Service, you must not access or use the Website.</p>
                    <p className='mb-4'>You must be at least 13 years old to use this Website. However, children of all ages may use the Website if enabled by a parent or legal guardian. If you are under 18, you represent that you have your parent or guardian's permission to use the Website. Please have them read these Terms of Service with you.</p>
                    <p className='mb-4'>If you are a parent or legal guardian of a user under the age of 18, by allowing your child to use the Website, you are subject to the terms of these Terms of Service and responsible for your child's activity on the Website.</p>
                    <p className='mb-4'>BY ACCESSING AND USING THIS WEBSITE, YOU: </p>
                    <p className='mb-4'>ACCEPT AND AGREE TO BE BOUND AND COMPLY WITH THESE TERMS OF SERVICE;</p>
                    <p className='mb-4'>YOU REPRESENT AND WARRANT THAT YOU ARE THE LEGAL AGE OF MAJORITY UNDER APPLICABLE LAW TO FORM A BINDING CONTRACT WITH US; AND, YOU AGREE IF YOU ACCESS THE WEBSITE FROM A JURISDICTION WHERE IT IS NOT PERMITTED, YOU DO SO AT YOUR OWN RISK.</p>
                
                    <h2 className='text-lg font-bold'>3. Updates to Terms of Service</h2>
                    <p>We may revise and update these Terms of Service from time to time in our sole discretion. All changes are effective immediately when we post them and apply to all access to and use of the Website thereafter.</p>
                    <p className='mb-4'>Continuing to use the Website following the posting of revised Terms of Service means that you accept and agree to the changes. You are expected to check this page each time you access this Website so you are aware of any changes, as they are binding on you.</p>

                    <h2 className='text-lg font-bold'>4. Your Responsibilities</h2>
                    <p>You are required to ensure that all persons who access the Website are aware of this Agreement and comply with it. It is a condition of your use of the Website that all the information you provide on the Website is correct, current, and complete.</p>
                    <p className='mb-4'>YOU ARE SOLELY AND ENTIRELY RESPONSIBLE FOR YOUR USE OF THE WEBSITE AND YOUR COMPUTER, INTERNET AND DATA SECURITY.</p>

                    
                    <h2 className='text-lg font-bold'>5. Prohibited Activities</h2>
                    <p>You may use the Website only for lawful purposes and in accordance with these Terms of Service. You agree not to use the Website:</p>
                    <ul className='ps-8 space-y-1 list-disc list-inside'>
                        <li>In any way that violates any applicable federal, state, local or international law or regulation.</li>
                        <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content, asking for personally identifiable information or otherwise.</li>
                        <li>To send, knowingly receive, upload, download, use, or re-use any material that does not comply with the Submission Standards set out in these Terms of Service.</li>
                        <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
                    </ul>

                    <p className='mt-4'>Additionally, you agree not to:</p>
                    <ul className='ps-8 space-y-1 list-disc list-inside'>
                        <li>Use the Website in any manner that could disable, overburden, damage, or impair the site or interfere with any other party's use of the Website, including their ability to engage in real-time activities through the Website.</li>
                        <li>Use any robot, spider, or other automatic device, process, or means to access the Website for any purpose, including monitoring or copying any of the material on the Website.</li>
                        <li>Use any manual process to monitor or copy any of the material on the Website, or for any other purpose not expressly authorized in these Terms of Service, without our prior written consent.</li>
                        <li>Use any device, software, or routine that interferes with the proper working of the Website.</li>
                        <li>Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful.</li>
                        <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Website, the server on which the Website is stored, or any server, computer, or database connected to the Website.</li>
                        <li>Attack the Website via a denial-of-service attack or a distributed denial-of-service attack.</li>
                        <li>Otherwise attempting to interfere with the proper working of the Website.</li>
                    </ul>

                    <h2 className='text-lg font-bold mt-4'>6. Intellectual Property Rights</h2>
                    <p>The Website and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by the Company, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
                    <p className='mb-4'>These Terms of Service permit you to use the Website for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Website, except as follows:</p>
                    <ul className='ps-8 space-y-1 list-disc list-inside'>
                        <li>Your computer may temporarily store copies of such material in RAM incidental to your accessing and viewing those materials.</li>
                        <li>You may store files that are automatically cached by your Web browser for display enhancement purposes.</li>
                        <li>You may print or download one copy of a reasonable number of pages of the Website for your own personal, non-commercial use and not for further reproduction, publication or distribution.</li>
                    </ul>

                    <p className='mt-4'>You must not:</p>
                    <ul className='ps-8 space-y-1 list-disc list-inside'>
                        <li>Modify copies of any materials from this site.</li>
                        <li>Delete or alter any of the copyright, trademark, or other proprietary rights notices from copies of materials from this site.</li>
                    </ul>

                    <p className='my-4'>You must not access or use for any commercial purposes any part of the website or any services or materials available through the Website.</p>

                    <p>If you print, copy, modify, download, or otherwise use or provide any other person with access to any part of the Website in breach of the Terms of Service, your right to use the Website will stop immediately and you must, at our option, return or destroy any copies of the materials you have made. No right, title, or interest in or to the Website or any content on the Website is transferred to you, and all rights not expressly granted are reserved by the Company. Any use of the Website not expressly permitted by these Terms of Service is a breach of these Terms of Service and may violate copyright, trademark, and other laws.</p>


                </div>
            </div>
        </section>
    );

}

export default Terms;
