import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import ThinRedButton from '../../components/buttons/ThinRedButton';
import TransactionHistoryModal from '../../components/modals/common/TransactionHistoryModal';
import { getCookieItem } from '../../utils/jwt';
import SearchFormVertical from '../../components/common/SearchFormVertical';

function Assessment() {
    const [transaction_history_modal, setTransactionHistoryModal] = useState(false);
    const [enrollments, setEnrollments] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
    const [searchParams, setSearchParams] = useState({ course: '', batch: '', year: '' });
    const [courseOptions, setCourseOptions] = useState([{ value: '', label: 'All Courses' }]);
    const [batchOptions, setBatchOptions] = useState([{ value: '', label: 'All Batches' }]);
    const [yearOptions, setYearOptions] = useState([{ value: '', label: 'All Years' }]);
    const token = getCookieItem('token');
    let studentId = null;
    if (token) {
        try {
            const decoded = require('../../utils/jwt').decodeToken(token);
            studentId = decoded?.data?.id || null;
        } catch (err) {
            console.error('Error decoding token for studentId:', err);
        }
    }

    // Fetch all courses and batches, and derive years from batches
    useEffect(() => {
        async function fetchCourses() {
            try {
                const token = getCookieItem('token');
                const url = `${process.env.REACT_APP_API_URL}/courses`;
                const res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    const options = [
                        { value: '', label: 'All Courses' },
                        ...data.map(course => ({ value: course.name, label: course.name }))
                    ];
                    setCourseOptions(options);
                }
            } catch (err) {
                setCourseOptions([{ value: '', label: 'All Courses' }]);
            }
        }

        async function fetchBatchesAndYears() {
            try {
                const token = getCookieItem('token');
                const url = `${process.env.REACT_APP_API_URL}/academic-periods`;
                const res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Batch options
                    const batchOpts = [
                        { value: '', label: 'All Batches' },
                        ...data.map(batch => ({ value: batch.batchName, label: batch.batchName }))
                    ];
                    setBatchOptions(batchOpts);
                    // Year options (unique years from batch.startAt)
                    const years = Array.from(new Set(
                        data
                            .map(batch => {
                                if (batch.startAt) {
                                    const d = new Date(batch.startAt);
                                    if (!isNaN(d)) return d.getFullYear();
                                }
                                return null;
                            })
                            .filter(Boolean)
                    )).sort((a, b) => b - a);
                    const yearOpts = [
                        { value: '', label: 'All Years' },
                        ...years.map(y => ({ value: y, label: y }))
                    ];
                    setYearOptions(yearOpts);
                }
            } catch (err) {
                setBatchOptions([{ value: '', label: 'All Batches' }]);
                setYearOptions([{ value: '', label: 'All Years' }]);
            }
        }

        fetchCourses();
        fetchBatchesAndYears();
    }, []);

    useEffect(() => {
        async function fetchAssessments() {
            try {
                const token = getCookieItem('token');
                const url = `${process.env.REACT_APP_API_URL}/assessment/student/${studentId}`;
                const res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json();
                // If the response is a single assessment object, wrap it in an array for consistency
                if (data && data.studentId && data.course && data.batch) {
                    setEnrollments([
                        {
                            course: data.course.name,
                            batch: data.batch.batchName,
                            year: data.batch.year,
                            netAssessment: Number(data.netAssessment).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                            totalPayments: Number(data.totalPayments).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                            remainingBalance: Number(data.remainingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                            fees: [
                                {
                                    description: `COURSE FEE${data.course.name ? ` (${data.course.name})` : ''}`,
                                    amount: Number(data.course.price).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                                    dueDate: ''
                                },
                                ...(data.fees || []).map(fee => ({
                                    description: fee.name,
                                    amount: Number(fee.price).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                                    dueDate: fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US') : ''
                                }))
                            ]
                        }
                    ]);
                } else if (Array.isArray(data)) {
                    setEnrollments(data);
                } else {
                    setEnrollments([]);
                }
            } catch (err) {
                setEnrollments([]);
            }
        }
        fetchAssessments();
    }, [studentId]);

    // Filter enrollments based on searchParams
    useEffect(() => {
        let filtered = enrollments;
        if (searchParams.course) {
            filtered = filtered.filter(e => e.course === searchParams.course);
        }
        if (searchParams.batch) {
            filtered = filtered.filter(e => e.batch === searchParams.batch);
        }
        if (searchParams.year) {
            filtered = filtered.filter(e => String(e.year) === String(searchParams.year));
        }
        setFilteredEnrollments(filtered);
    }, [enrollments, searchParams]);

    const searchFormConfig = {
        title: "SEARCH",
        formFields: [
            {
                name: "course",
                label: "Course",
                type: "select",
                options: courseOptions
            },
            {
                name: "batch",
                label: "Batch",
                type: "select",
                options: batchOptions
            },
            {
                name: "year",
                label: "Year",
                type: "select",
                options: yearOptions
            }
        ]
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // No-op, filtering is live as searchParams changes
    };

    // For SearchFormVertical: handle input change for selects/inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prev) => ({ ...prev, [name]: value }));
    };

    const getStudentFee = (enroll) => {
        const studentFees = (enroll.studentFees || []).map(fee => ({
            description: fee.name,
            amount: Number(fee.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            dueDate: fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US') : ''
        }));
        return [
            ...studentFees
        ];
    };


    // Handler to select an enrollment and fetch full assessment details
    const handleSelectEnrollment = async (enroll) => {
        setStudentDetailsLoading(true);
        setSelectedEnrollment(null); // Optionally show loading state
        try {
            const token = getCookieItem('token');
            const res = await fetch(`${process.env.REACT_APP_API_URL}/assessment/${enroll.studentId}?courseId=${enroll.courseId}&academicPeriodId=${enroll.batchId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) throw new Error('Failed to fetch student assessment');
            const data = await res.json();
            // Map backend data to frontend structure for selectedEnrollment
            const fees = [];
            if (data.course && data.course.price) {
                fees.push({
                    name: `COURSE FEE${data.course.name ? ` (${data.course.name})` : ''}`,
                    price: Number(data.course.price),
                    dueDate: ''
                });
            }
            if (data.fees && Array.isArray(data.fees)) {
                data.fees.forEach(fee => {
                    if (
                        !data.course ||
                        !fee.name ||
                        (fee.name.toLowerCase() !== 'course fee' && fee.name !== data.course.name)
                    ) {
                        fees.push({
                            name: fee.name,
                            price: Number(fee.price),
                            dueDate: fee.dueDate
                        });
                    }
                });
            }
            setSelectedEnrollment({
                id: data.studentId,
                name: data.name || '',
                course: data.course?.name || '',
                batch: data.batch?.batchName || '',
                year: data.batch?.year || '',
                courseId: data.course?.id,
                batchId: data.batch?.id,
                fees,
                coursedueDate: data.coursedueDate ? new Date(data.coursedueDate).toLocaleDateString('en-US') : '',
                studentFees: data.studentFees || [],
                netAssessment: Number(data.netAssessment || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                totalPayments: Number(data.totalPayments || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                remainingBalance: Number(data.remainingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
            });
        } catch (err) {
            setSelectedEnrollment(enroll); // fallback to basic info
        } finally {
            setStudentDetailsLoading(false);
        }
    };

    return (
        <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-16 lg:items-start">
                <div className="w-full lg:w-80 lg:flex-shrink-0 lg:self-start">
                    <SearchFormVertical
                        searchLogic={{
                            searchParams,
                            handleInputChange,
                        }}
                        fields={searchFormConfig}
                        onSearch={handleSearch}
                    />
                </div>
                <div className="w-full lg:flex-1 bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10">
                    <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center mb-3 sm:mb-5">
                        Tuition Fee Assessment
                    </p>
                    {/* List View or Loading State */}
                    {!selectedEnrollment && !studentDetailsLoading ? (
                        <>
                            <p className="font-semibold mb-3 text-sm sm:text-base">
                                {filteredEnrollments.length === 0 ? "No assessments found." : `Your Assessments (${filteredEnrollments.length})`}
                            </p>
                            <div className="space-y-2 mb-5">
                                {filteredEnrollments.map((enroll, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelectEnrollment(enroll)}
                                        className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                                            <div>
                                                <p className="font-semibold text-sm sm:text-base">{enroll.course}</p>
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    {enroll.batch} | {enroll.year}
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs sm:text-sm text-gray-600">Remaining Balance:</p>
                                                <p className="font-semibold text-sm sm:text-base">{Number(enroll.remainingBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : studentDetailsLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
                                <p className="text-lg">Loading student's assessment...</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-5 gap-2 sm:gap-0">
                                <p className="font-bold text-base sm:text-lg text-center sm:text-left">
                                    {selectedEnrollment.course}: {selectedEnrollment.batch} | {selectedEnrollment.year}
                                </p>
                                <button
                                    onClick={() => setSelectedEnrollment(null)}
                                    className="text-dark-red-2 hover:text-dark-red-5 font-semibold text-sm sm:text-base w-full sm:w-auto text-left sm:text-right"
                                >
                                    Back to List
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-end pb-3 border-b-2 border-dark-red-2 gap-3 sm:gap-0">
                                <p className="uppercase grow text-base sm:text-lg font-semibold text-left">Student</p>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                                    <ThinRedButton onClick={() => { setTransactionHistoryModal(true) }}>
                                        Transaction History
                                    </ThinRedButton>
                                    <span className="hidden sm:inline mx-2"></span>
                                    <Link to="/student/ledger" state={{ status: "fromAssessment" }}>
                                        <ThinRedButton>Ledger</ThinRedButton>
                                    </Link>
                                </div>
                            </div>
                            <p className="font-bold text-base sm:text-lg text-center mt-6 sm:mt-9 mb-1">COURSE FEES</p>
                            <div className="overflow-x-auto mb-5">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b-2 border-dark-red-2">
                                            <th className="py-2 font-bold text-start text-xs sm:text-sm lg:text-base">
                                                Description
                                            </th>
                                            <th className="py-2 font-bold text-center text-xs sm:text-sm lg:text-base">Amount</th>
                                            <th className="py-2 font-bold text-center text-xs sm:text-sm lg:text-base">Due date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedEnrollment.fees || []).map((fee, i) => (
                                            <tr key={i} className="border-b-2 border-[rgb(137,14,7,.49)]">
                                                <td className="uppercase py-2 text-xs sm:text-sm lg:text-base">{fee.name || fee.description}</td>
                                                <td className="py-2 text-center text-xs sm:text-sm lg:text-base">{fee.price ? Number(fee.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : fee.amount}</td>
                                                <td className="py-2 text-center text-xs sm:text-sm lg:text-base">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US') : '' || selectedEnrollment.coursedueDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {selectedEnrollment.studentFees && selectedEnrollment.studentFees.length > 0 && (
                                <>
                                    <p className="font-bold text-base sm:text-lg text-center mb-1">ADDITIONAL FEES / DISCOUNTS</p>
                                    <div className="overflow-x-auto mb-5">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b-2 border-dark-red-2">
                                                    <th className="py-2 font-bold text-start text-xs sm:text-sm lg:text-base">
                                                        Description
                                                    </th>
                                                    <th className="py-2 font-bold text-center text-xs sm:text-sm lg:text-base">Amount</th>
                                                    <th className="py-2 font-bold text-center text-xs sm:text-sm lg:text-base">Due date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedEnrollment.studentFees.map((sf, index) => (
                                                    <tr key={`studentFee-${index}`} className="border-b-2 border-[rgb(137,14,7,.49)]">
                                                        <td className="uppercase py-2 text-xs sm:text-sm lg:text-base">{sf.name}</td>
                                                        <td className={`py-2 text-center text-xs sm:text-sm lg:text-base ${sf.type === 'discount' ? 'text-green-600' : ''}`}>{sf.type === 'discount' ? '-' : ''}{Number(sf.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                        <td className="py-2 text-center text-xs sm:text-sm lg:text-base">{sf.dueDate ? new Date(sf.dueDate).toLocaleDateString('en-US') : ''}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                            <div className="w-full pt-3 border-t-2 border-dark-red-2">
                                <div className="flex flex-col gap-2 text-xs sm:text-sm lg:text-base">
                                    <div className="flex justify-between">
                                        <p className="font-bold">Net Assessment</p>
                                        <p>{selectedEnrollment.netAssessment}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="font-bold">Total Payments</p>
                                        <p>{selectedEnrollment.totalPayments}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="font-bold">Remaining Balance</p>
                                        <p>{selectedEnrollment.remainingBalance}</p>
                                    </div>
                                </div>
                            </div>
                            <Link to="/paymentform" className="flex flex-row justify-end mt-10">
                                <span className="m-0">
                                    <ThinRedButton>Proceed to Payment</ThinRedButton>
                                </span>
                            </Link>
                            <TransactionHistoryModal
                                transaction_history_modal={transaction_history_modal}
                                setTransactionHistoryModal={setTransactionHistoryModal}
                                studentId={selectedEnrollment.id}
                                courseId={selectedEnrollment.courseId}
                                batchId={selectedEnrollment.batchId}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Assessment;