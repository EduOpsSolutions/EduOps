import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Bg_image from '../../assets/images/Bg7.jpg';
import SmallButton from '../../components/buttons/SmallButton';
import UserNavbar from '../../components/navbars/UserNav';
import FileUploadButton from '../../components/textFields/FileUploadButton';
import LabelledInputField from '../../components/textFields/LabelledInputField';
import NotLabelledInputField from '../../components/textFields/NotLabelledInputField';
import SelectField from '../../components/textFields/SelectField';
import { guestUploadFile } from '../../utils/files';
import useEnrollmentStore from '../../stores/enrollmentProgressStore';
import axiosInstance from '../../utils/axios';
import { checkOngoingEnrollmentPeriod } from '../../utils/enrollmentPeriodUtils';
import Swal from 'sweetalert2';

function SignUp() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setEnrollmentData } = useEnrollmentStore();

  // Add any missing options
  const civilStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
  ];

  const honorrificOptions = [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Mrs.', label: 'Mrs.' },
  ];

  const sexOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
  ];

  // Please check if reffered by options are complete and add the missing fields
  const referredByOptions = [
    { value: 'family', label: 'Family' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'social media', label: 'Social Media' },
    { value: 'website', label: 'Website' },
    { value: 'other', label: 'Other' },
  ];

  const [courseOptions, setCourseOptions] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesData, setCoursesData] = useState([]);
  const [enrollmentPeriodCheck, setEnrollmentPeriodCheck] = useState({
    loading: true,
    hasOngoingPeriod: false,
    currentPeriod: null,
    error: null,
  });

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      let visibleCourses = [];
      let academicPeriodCourseIds = [];
      // If there is an open batch, fetch academic_period_courses for that period
      if (enrollmentPeriodCheck.currentPeriod && enrollmentPeriodCheck.currentPeriod.id) {
        const apcRes = await axiosInstance.get(`/academic-period-courses/${enrollmentPeriodCheck.currentPeriod.id}/courses`);
        academicPeriodCourseIds = apcRes.data.map(apc => apc.courseId);
      }
      // Fetch all courses
      const response = await axiosInstance.get('/courses');
      visibleCourses = response.data.filter(
        (course) => course.visibility === 'visible'
      );
      // If we have academic period course IDs, filter to only those
      if (academicPeriodCourseIds.length > 0) {
        visibleCourses = visibleCourses.filter(course => academicPeriodCourseIds.includes(course.id));
      }
      setCoursesData(visibleCourses);
      const courseOptions = visibleCourses.map((course) => ({
        value: course.id,
        label: course.name,
        price: course.price,
        disabled: false,
      }));
      // Fetch course requisites for all visible courses
      if (visibleCourses.length > 0) {
        try {
          const courseIds = visibleCourses.map(c => c.id);
          const res = await axiosInstance.get(`/course-requisites?courseIds=${courseIds.join(',')}`);
          const requisitesMap = {};
          res.data.forEach(r => {
            requisitesMap[r.courseId] = true;
          });
          // Update disabled property and label for options with requisites
          courseOptions.forEach(opt => {
            if (requisitesMap[opt.value]) {
              opt.disabled = true;
              opt.label = `${opt.label} (Requires prerequisite)`;
            }
          });
        } catch (e) {
          // If error, just skip disabling
        }
      }
      setCourseOptions(courseOptions);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load available courses. Please refresh the page.',
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  const checkEnrollmentPeriod = async () => {
    try {
      setEnrollmentPeriodCheck((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const result = await checkOngoingEnrollmentPeriod();

      setEnrollmentPeriodCheck({
        loading: false,
        hasOngoingPeriod: result.hasOngoingPeriod,
        currentPeriod: result.currentPeriod,
        error: result.error,
      });

      return result;
    } catch (error) {
      console.error('Failed to check enrollment periods:', error);
      const errorResult = {
        hasOngoingPeriod: false,
        currentPeriod: null,
        error: 'Failed to check enrollment availability',
      };

      setEnrollmentPeriodCheck({
        loading: false,
        ...errorResult,
      });

      return errorResult;
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      const periodCheck = await checkEnrollmentPeriod();

      // Only fetch courses if enrollment is available
      if (periodCheck.hasOngoingPeriod) {
        await fetchCourses();
      }
    };

    initializePage();
  }, []);

  useEffect(() => {
    // Refetch courses whenever the open enrollment period changes
    if (enrollmentPeriodCheck.hasOngoingPeriod && enrollmentPeriodCheck.currentPeriod) {
      fetchCourses();
    } else {
      setCourseOptions([]);
      setCoursesData([]);
    }
  }, [enrollmentPeriodCheck.currentPeriod]);

  const [validId, setValidId] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [validIdUploading, setValidIdUploading] = useState(false);
  const [idPhotoUploading, setIdPhotoUploading] = useState(false);

  const [contactNumbers, setContactNumbers] = useState({
    contactNumber: '',
    altContactNumber: '',
    motherContact: '',
    fatherContact: '',
    guardianContact: '',
  });

  // Handle contact number input - only allow numbers
  const handleContactNumberChange = (e) => {
    const { name, value } = e.target;
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    setContactNumbers((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleFileChange = async (event, setFile) => {
    const file = event.target.files[0];
    setFile(file);

    try {
      if (event.target.id === 'validId') {
        setValidIdUploading(true);
        const result = await guestUploadFile(file, 'proof-ids');
        console.log('result', result);
        if (result.error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to Upload Valid ID',
          });
          return;
        }
        setValidId(result.data.downloadURL);
      } else if (event.target.id === 'idPhoto') {
        setIdPhotoUploading(true);
        const result = await guestUploadFile(file, 'enrollment');
        if (result.error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to Upload 2x2 ID Photo',
          });
          return;
        }
        setIdPhoto(result.data.downloadURL);
      }
    } finally {
      setValidIdUploading(false);
      setIdPhotoUploading(false);
    }
  };

  const [emailError, setEmailError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Email format validator (simple regex)
  const isValidEmailFormat = (email) => {
    // Basic email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Async email validator using new public endpoint, only if format is valid
  const validateEmailUnique = async (email) => {
    setEmailError("");
    if (!isValidEmailFormat(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setCheckingEmail(true);
    try {
      const res = await axiosInstance.get(`/enrollment/check-email`, {
        params: { email },
      });
      if (res.data && res.data.exists) {
        setEmailError("This email is already used in an enrollment request.");
      } else {
        setEmailError("");
      }
    } catch (e) {
      setEmailError("Could not validate email. Try again later.");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.target);
    const enrollmentData = {};

    try {
      if (!validId || !idPhoto) {
        throw new Error('Both Valid ID and 2x2 ID Photo are required');
      }

      // Ensure files are uploaded as URLs, not File objects
      if (typeof validId !== 'string' || typeof idPhoto !== 'string') {
        throw new Error(
          'Please wait for file uploads to complete before submitting'
        );
      }

      // Check if uploads are still in progress
      if (validIdUploading || idPhotoUploading) {
        throw new Error('Please wait for file uploads to complete');
      }

      console.log('validId', validId);
      console.log('idPhoto', idPhoto);
      enrollmentData['validIdPath'] = validId;
      enrollmentData['idPhotoPath'] = idPhoto;
      for (let [key, value] of formData.entries()) {
        if (
          key !== 'validIdPath' &&
          key !== 'idPhotoPath' &&
          ![
            'contactNumber',
            'altContactNumber',
            'motherContact',
            'fatherContact',
            'guardianContact',
          ].includes(key)
        ) {
          enrollmentData[key] = value;
        }
      }

      // Add contact numbers from state
      enrollmentData.contactNumber = contactNumbers.contactNumber;
      enrollmentData.altContactNumber = contactNumbers.altContactNumber;
      enrollmentData.motherContact = contactNumbers.motherContact;
      enrollmentData.fatherContact = contactNumbers.fatherContact;
      enrollmentData.guardianContact = contactNumbers.guardianContact;

      // Get selected course details (name and price) based on course ID
      const selectedCourseId = enrollmentData.coursesToEnroll;
      const selectedCourse = coursesData.find(
        (course) => course.id === selectedCourseId
      );

      if (selectedCourse) {
        enrollmentData.coursesToEnroll = selectedCourse.name;
      }

      console.log('enrollmentData', enrollmentData);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/enrollment/enroll`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enrollmentData),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // Set enrollment data in store with proper initial state
      const enrollmentStoreData = {
        enrollmentId: result.data.enrollmentId,
        status: 'PENDING', // Default status for new enrollments
        currentStep: 2,
        completedSteps: [1],
        remarkMsg:
          'Your enrollment form has been submitted. Please wait for verification.',
        fullName: `${result.data.firstName} ${
          result.data.middleName ? result.data.middleName + ' ' : ''
        }${result.data.lastName}`,
        email: result.data.preferredEmail,
        coursesToEnroll: result.data.coursesToEnroll,
        coursePrice: selectedCourse?.price,
        courseName: selectedCourse?.name,
        createdAt: result.data.createdAt,
      };

      setEnrollmentData(enrollmentStoreData);

      await Swal.fire({
        title: 'Success!',
        text: 'Enrollment form submitted successfully!',
        icon: 'success',
        confirmButtonColor: '#992525',
        confirmButtonText: 'Continue',
      });
      navigate('/enrollment');
    } catch (error) {
      console.error('Error details:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message,
        icon: 'error',
  confirmButtonColor: '#992525',
        confirmButtonText: 'Try Again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <UserNavbar role="public" />
      <section
        className="flex justify-center items-center bg-white-yellow-tone bg-center bg-cover bg-no-repeat bg-blend-multiply"
        style={{
          backgroundImage: `url(${Bg_image})`,
          minHeight: '100vh',
          backgroundPosition: '100% 35%',
        }}
      >
        <div className="relative max-w-full mx-auto bg-white-yellow-tone w-11/12 px-8 py-4 mt-8 mb-12 flex flex-col rounded-lg">
          {/* Loading State */}
          {enrollmentPeriodCheck.loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-red mb-4"></div>
              <p className="text-lg text-gray-600">
                Checking enrollment availability...
              </p>
            </div>
          )}

          {/* No Ongoing Enrollment Period */}
          {!enrollmentPeriodCheck.loading &&
            !enrollmentPeriodCheck.hasOngoingPeriod && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-8">
                  <svg
                    className="w-24 h-24 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Enrollment Currently Unavailable
                  </h1>
                  <div className="max-w-2xl mx-auto">
                    <p className="text-lg text-gray-600 mb-6">
                      We're sorry, enrollment has ended or has not yet started.
                    </p>

                    {enrollmentPeriodCheck.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-red-600 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-red-700">
                            {enrollmentPeriodCheck.error}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">
                        What can you do?
                      </h3>
                      <ul className="text-left text-blue-700 space-y-2">
                        <li className="flex items-start">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Check back regularly for new enrollment period.
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Follow our social media for enrollment announcements.
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Contact us directly for information about upcoming
                          enrollments.
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => navigate('/')}
                        className="bg-dark-red hover:bg-dark-red-2 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Return to Home
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Enrollment Form - Only show if there's an ongoing period */}
          {!enrollmentPeriodCheck.loading &&
            enrollmentPeriodCheck.hasOngoingPeriod && (
              <>
                {/* Current Enrollment Period Info */}
                {enrollmentPeriodCheck.currentPeriod && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-green-800">
                          Current Enrollment Period
                        </h2>
                        <p className="text-green-700">
                          <strong>
                            Batch:{' '}
                            {enrollmentPeriodCheck.currentPeriod.batchName}
                          </strong>
                        </p>
                        <p className="text-sm text-green-600">
                          Ends:{' '}
                          {new Date(
                            enrollmentPeriodCheck.currentPeriod.endAt
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        Enrollment Open
                      </span>
                    </div>
                  </div>
                )}

                <form
                  className="px-8 py-4 flex flex-col"
                  onSubmit={handleSubmit}
                >
                  <h1 className="text-center text-3xl font-bold">
                    Enrollment Form
                  </h1>
                  <p className="italic mb-5 font-semibold">
                    Items with (*) are required fields
                  </p>
                  <div className="grid md:grid-cols-3 md:gap-6">
                    <NotLabelledInputField
                      name="firstName"
                      id="first_name"
                      label="First name*"
                      type="text"
                      required={true}
                    />
                    <NotLabelledInputField
                      name="middleName"
                      id="middle_name"
                      label="Middle name"
                      type="text"
                      required={false}
                    />
                    <NotLabelledInputField
                      name="lastName"
                      id="last_name"
                      label="Last name*"
                      type="text"
                      required={true}
                    />
                  </div>
                  <div className="grid md:grid-cols-4 md:gap-6">
                    <LabelledInputField
                      name="extensions"
                      id="extensions"
                      label="Extension"
                      type="text"
                      required={false}
                      placeholder="Jr., Sr. III, etc."
                    />
                    <div className="grid md:grid-cols-2 md:gap-6">
                      <SelectField
                        name="honorrific"
                        id="honorrific"
                        label="Honorrific*"
                        required={true}
                        options={honorrificOptions}
                      />
                      <SelectField
                        name="sex"
                        id="sex"
                        label="Sex*"
                        required={true}
                        options={sexOptions}
                      />
                    </div>
                    <LabelledInputField
                      name="birthDate"
                      id="birthdate"
                      label="Birth Date*"
                      type="date"
                      required={true}
                    />
                    <SelectField
                      name="civilStatus"
                      id="civil_status"
                      label="Civil Status*"
                      required={true}
                      options={civilStatusOptions}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 md:gap-6">
                    <div className="col-span-2">
                      <LabelledInputField
                        name="address"
                        id="address"
                        label="Current Address*"
                        type="text"
                        required={true}
                        placeholder="Street, Barangay, City, Province, Zip Code"
                      />
                    </div>
                    <div className="col-span-1">
                      <SelectField
                        name="referredBy"
                        id="referred_by"
                        label="Referred By*"
                        required={true}
                        options={referredByOptions}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 md:gap-6">
                    <LabelledInputField
                      name="contactNumber"
                      id="contact_number"
                      label="Contact Number*"
                      type="tel"
                      required={true}
                      placeholder="09xxxxxxxxx"
                      value={contactNumbers.contactNumber}
                      onChange={handleContactNumberChange}
                      minLength="11"
                      maxLength="15"
                    />
                    <LabelledInputField
                      name="altContactNumber"
                      id="alt_contact_number"
                      label="Alternate Contact Number"
                      type="tel"
                      required={false}
                      placeholder="09xxxxxxxxx"
                      value={contactNumbers.altContactNumber}
                      onChange={handleContactNumberChange}
                      minLength="11"
                      maxLength="15"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="flex flex-col">
                      <LabelledInputField
                        name="preferredEmail"
                        id="preferred_email"
                        label="Preferred Email Address*"
                        type="email"
                        required={true}
                        placeholder="johndoe@gmail.com"
                        onBlur={e => validateEmailUnique(e.target.value)}
                        onChange={e => { handleContactNumberChange(e); setEmailError(""); }}
                        error={emailError}
                      />
                      {emailError && (
                        <div className="text-red-600 text-sm mt-1 mb-2">{emailError}</div>
                      )}
                    </div>
                    <LabelledInputField
                      name="altEmail"
                      id="alt_email"
                      label="Alternate Email Address"
                      type="email"
                      required={false}
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 md:gap-6">
                    <LabelledInputField
                      name="motherName"
                      id="mother_name"
                      label="Mother's Maiden Full Name"
                      type="text"
                      required={false}
                      placeholder=""
                    />
                    <LabelledInputField
                      name="motherContact"
                      id="mother_contact_number"
                      label="Contact Number"
                      type="tel"
                      required={false}
                      placeholder="09xxxxxxxxx"
                      value={contactNumbers.motherContact}
                      onChange={handleContactNumberChange}
                      minLength="11"
                      maxLength="15"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 md:gap-6">
                    <LabelledInputField
                      name="fatherName"
                      id="father_name"
                      label="Father's Full Name"
                      type="text"
                      required={false}
                      placeholder=""
                    />
                    <LabelledInputField
                      name="fatherContact"
                      id="father_contact_number"
                      label="Contact Number"
                      type="tel"
                      required={false}
                      placeholder="09xxxxxxxxx"
                      value={contactNumbers.fatherContact}
                      onChange={handleContactNumberChange}
                      minLength="11"
                      maxLength="15"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 md:gap-6">
                    <LabelledInputField
                      name="guardianName"
                      id="guardian_name"
                      label="Guardian's Full Name"
                      type="text"
                      required={false}
                      placeholder=""
                    />
                    <LabelledInputField
                      name="guardianContact"
                      id="guardian_contact_number"
                      label="Contact Number"
                      type="tel"
                      required={false}
                      placeholder="09xxxxxxxxx"
                      value={contactNumbers.guardianContact}
                      onChange={handleContactNumberChange}
                      minLength="11"
                      maxLength="15"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 md:gap-6">
                    <div>
                      <SelectField
                        name="coursesToEnroll"
                        id="courses_to_enroll"
                        label="Select Course(s) to Enroll*"
                        required={true}
                        options={
                          coursesLoading
                            ? [{ value: '', label: 'Loading courses...' }]
                            : courseOptions.length > 0
                            ? courseOptions
                            : [{ value: '', label: 'No courses available' }]
                        }
                        disabled={coursesLoading}
                      />
                    </div>
                  </div>

                  <FileUploadButton
                    label="Upload Valid ID (front and back)*"
                    id="validId"
                    name="validIdPath"
                    onChange={(e) => handleFileChange(e, setValidId)}
                    ariaDescribedBy="valid_id_help"
                    isUploading={validIdUploading}
                  />
                  <FileUploadButton
                    label="Upload 2X2 ID Photo (white background)*"
                    id="idPhoto"
                    name="idPhotoPath"
                    onChange={(e) => handleFileChange(e, setIdPhoto)}
                    ariaDescribedBy="2x2_id_help"
                    isUploading={idPhotoUploading}
                  />
                  {/* Button navigates to enrollment page after submission */}
                  <SmallButton
                    type="submit"
                    disabled={
                      isSubmitting || validIdUploading || idPhotoUploading || !!emailError || checkingEmail
                    }
                  >
                    {isSubmitting
                      ? 'Submitting...'
                      : validIdUploading || idPhotoUploading
                      ? 'Uploading...'
                      : 'Proceed'}
                  </SmallButton>
                </form>
              </>
            )}
        </div>
      </section>
    </>
  );
}

export default SignUp;
